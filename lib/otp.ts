import { createHash, randomInt, randomUUID } from "crypto";

export const OTP_TTL_MINUTES = 5;
export const OTP_MAX_ATTEMPTS = 5;

// Geliştirme modu: gerçek WhatsApp authentication şablonu Meta'da onaylanana
// kadar kod WhatsApp'a gönderilmez, sunucu logunda görünür.
// Onaylanınca burada whatsapp Cloud API çağrısı eklenip DEV_MODE kapatılır.
export const OTP_DEV_MODE = true;

export function generateCode(): string {
  return String(randomInt(0, 1_000_000)).padStart(6, "0");
}

export function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function newReferralCode(): string {
  return randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

export function normalizePhone(raw: string): string | null {
  const digits = raw.replace(/[^0-9]/g, "");
  // Kullanıcı 90'sız 10 haneli girer (5XX XXX XX XX varsayımı, arayüzde +90 sabit).
  if (digits.length === 10 && digits.startsWith("5")) return "+90" + digits;
  if (digits.length === 12 && digits.startsWith("90")) return "+" + digits;
  if (digits.length === 13 && raw.trim().startsWith("+90")) return "+" + digits;
  return null;
}
