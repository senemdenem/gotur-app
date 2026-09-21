import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { generateCode, hashCode, normalizePhone, OTP_TTL_MINUTES, OTP_DEV_MODE } from "@/lib/otp";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = normalizePhone(body?.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "Geçersiz telefon numarası" }, { status: 400 });
  }

  const pool = getPool();

  // Basit hız sınırı: son 60 saniyede aynı numaraya kod gittiyse tekrar gönderme.
  const recent = await pool.query(
    `select id from otp_codes where phone = $1 and created_at > now() - interval '60 seconds' order by created_at desc limit 1`,
    [phone]
  );
  if (recent.rows.length > 0) {
    return NextResponse.json({ error: "Çok sık istek. Birazdan tekrar dene." }, { status: 429 });
  }

  const code = generateCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MINUTES * 60 * 1000);
  await pool.query(
    `insert into otp_codes (phone, code_hash, expires_at) values ($1, $2, $3)`,
    [phone, hashCode(code), expiresAt]
  );

  if (OTP_DEV_MODE) {
    // WhatsApp authentication şablonu onaylanınca burası Cloud API çağrısına dönüşür.
    console.log(`[OTP][DEV MODE] ${phone} -> ${code} (5 dk geçerli)`);
    return NextResponse.json({ ok: true, devCode: code });
  }

  // TODO: WhatsApp Cloud API authentication şablonu onaylanınca burada gönderilecek.
  return NextResponse.json({ ok: true });
}
