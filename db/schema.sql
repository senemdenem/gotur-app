-- Götür.tr PWA — Postgres şeması (v1)
-- Mevcut n8n eşleştirme akışı (Yuk Filtreli Bildirim v3) ve Google Sheets yedeği
-- ile paralel çalışacak şekilde tasarlandı; şoför/güzergah/ilan/üyelik verisi
-- buraya taşınır, Telegram bağımlılığı kalkar.

create extension if not exists pgcrypto;

-- Kullanıcılar (şoförler + ilan verenler aynı tablo)
create table users (
  id            uuid primary key default gen_random_uuid(),
  phone         text not null unique,          -- E.164, ör. +905551234567
  first_name    text,
  last_name     text,
  avatar_url    text,
  referral_code text not null unique,          -- davet linki kodu (ör. MEH7K2)
  referred_by   uuid references users(id),
  is_admin      boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- OTP kodları (WhatsApp ile gönderilen giriş kodu)
create table otp_codes (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null,
  code_hash   text not null,                    -- kodun kendisi değil, hash'i tutulur
  expires_at  timestamptz not null,
  consumed_at timestamptz,
  attempts    int not null default 0,
  created_at  timestamptz not null default now()
);
create index otp_codes_phone_idx on otp_codes(phone, created_at desc);

-- Oturumlar (OTP doğrulanınca uzun ömürlü cookie/token)
create table sessions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  token_hash text not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create index sessions_user_idx on sessions(user_id);

-- Güzergahlar (şoförün bildirim almak istediği il/ilçe çiftleri)
create table routes (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  from_il      text not null,
  from_ilce    text,                            -- null = ilin tamamı
  to_il        text not null,
  to_ilce      text,
  include_return boolean not null default false, -- dönüş yükleri de gelsin
  is_active    boolean not null default true,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index routes_user_idx on routes(user_id) where is_active;
create index routes_matching_idx on routes(from_il, to_il) where is_active;

-- Push abonelikleri (Web Push, bir kullanıcının birden fazla cihazı olabilir)
create table push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references users(id) on delete cascade,
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  user_agent text,
  created_at timestamptz not null default now()
);
create index push_subscriptions_user_idx on push_subscriptions(user_id);

-- Üyelikler (deneme + satın alınan + davet ödülü + admin hediyesi — üst üste eklenir)
create type membership_source as enum ('trial', 'purchase', 'referral', 'admin_grant');
create type membership_status as enum ('pending', 'active', 'expired', 'cancelled');

create table memberships (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  source       membership_source not null,
  status       membership_status not null default 'pending',
  plan_months  int,                             -- 1/3/6/12, trial ve referral için null
  amount_try   numeric(10,2),                   -- ödenen tutar (varsa)
  starts_at    timestamptz,
  ends_at      timestamptz,
  payment_ref  text,                             -- ödeme sağlayıcı işlem no / havale dekontu
  granted_by   uuid references users(id),        -- admin_grant ise hangi admin
  created_at   timestamptz not null default now()
);
create index memberships_user_idx on memberships(user_id, ends_at desc);

-- İlanlar (kullanıcının İş Paylaşımı'nda verdiği yükler)
create type ilan_status as enum ('active', 'closed', 'expired');
create type ilan_contact_type as enum ('own', 'other');

create table ilanlar (
  id                  uuid primary key default gen_random_uuid(),
  owner_id            uuid not null references users(id) on delete cascade,
  from_il             text not null,
  from_ilce           text,
  to_il               text not null,
  to_ilce             text,
  cargo_type          text,
  weight_tons         numeric(6,2),
  loading_date        date,
  contact_type        ilan_contact_type not null default 'own',
  contact_phone       text,                      -- contact_type='other' ise dolu
  whatsapp_enabled     boolean not null default true,
  status              ilan_status not null default 'active',
  notification_count  int not null default 0,    -- ilk paylaşım + düzenleme bildirimleri
  expires_at          timestamptz not null,       -- created_at + 48 saat
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index ilanlar_owner_idx on ilanlar(owner_id, status);
create index ilanlar_matching_idx on ilanlar(from_il, to_il) where status = 'active';

-- Davetler (referans programı)
create table referrals (
  id           uuid primary key default gen_random_uuid(),
  inviter_id   uuid not null references users(id) on delete cascade,
  invitee_id   uuid references users(id),         -- kayıt olunca dolar
  status       text not null default 'invited',   -- invited | registered | rewarded
  rewarded_at  timestamptz,
  created_at   timestamptz not null default now()
);
create index referrals_inviter_idx on referrals(inviter_id);

-- Wa Cloud API üzerinden gelen WhatsApp yükleri (mevcut scrape akışının hedefi)
-- Not: eşleştirme mantığı n8n'de kalmaya devam ediyor; bu tablo sadece
-- PWA'nın "Yüklerim" listesinde gösterdiği kaynak kaydı tutar.
create table wa_yukler (
  id           uuid primary key default gen_random_uuid(),
  from_il      text not null,
  from_ilce    text,
  to_il        text not null,
  to_ilce      text,
  raw_message  text,
  source_group text,
  created_at   timestamptz not null default now()
);
create index wa_yukler_matching_idx on wa_yukler(from_il, to_il, created_at desc);
