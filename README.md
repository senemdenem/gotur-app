# Götür.tr — PWA

Şoförler için yük bildirim uygulaması. Telegram bağımlılığını kaldırıp
web push + PWA'ya geçiş projesi.

- **Tasarım kanvası:** ekran taslakları (Yüklerim, İş Paylaşımı, Güzergahlarım,
  Profil, Üyelik, tanıtım akışı) ayrı bir Design artifact'te.
- **Canlı adres:** app.goturtr.com (kuruluyor)
- **Stack:** Next.js 14 (App Router), React 18, TypeScript

## Geliştirme

```bash
npm install
npm run dev
```

## Yol haritası

1. ✅ Proje iskeleti, PWA manifest, renk tokenları (açık/koyu tema)
2. Telefon + WhatsApp OTP girişi (auth)
3. Güzergahlarım, Yüklerim, İş Paylaşımı ekranları
4. Web Push aboneliği, n8n eşleştirme akışına bağlanma
5. Üyelik / ödeme, davet sistemi
6. Admin paneli (ayrı alt domain)
