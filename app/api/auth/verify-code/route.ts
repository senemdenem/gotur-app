import { NextRequest, NextResponse } from "next/server";
import { getPool } from "@/lib/db";
import { hashCode, newReferralCode, normalizePhone, OTP_MAX_ATTEMPTS } from "@/lib/otp";
import { createSession } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = normalizePhone(body?.phone ?? "");
  const code: string = String(body?.code ?? "").trim();
  if (!phone || code.length !== 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  const pool = getPool();
  const { rows } = await pool.query(
    `select id, code_hash, attempts, expires_at, consumed_at from otp_codes
     where phone = $1 order by created_at desc limit 1`,
    [phone]
  );
  const otp = rows[0];
  if (!otp || otp.consumed_at || new Date(otp.expires_at) < new Date()) {
    return NextResponse.json({ error: "Kodun süresi doldu, yeniden iste." }, { status: 400 });
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    return NextResponse.json({ error: "Çok fazla hatalı deneme. Yeni kod iste." }, { status: 400 });
  }
  if (otp.code_hash !== hashCode(code)) {
    await pool.query(`update otp_codes set attempts = attempts + 1 where id = $1`, [otp.id]);
    return NextResponse.json({ error: "Kod hatalı" }, { status: 400 });
  }

  await pool.query(`update otp_codes set consumed_at = now() where id = $1`, [otp.id]);

  let { rows: userRows } = await pool.query(`select id from users where phone = $1`, [phone]);
  let userId: string;
  if (userRows.length === 0) {
    const inserted = await pool.query(
      `insert into users (phone, referral_code) values ($1, $2) returning id`,
      [phone, newReferralCode()]
    );
    userId = inserted.rows[0].id;
    // İlk üyelik: 10 gün deneme.
    await pool.query(
      `insert into memberships (user_id, source, status, starts_at, ends_at)
       values ($1, 'trial', 'active', now(), now() + interval '10 days')`,
      [userId]
    );
  } else {
    userId = userRows[0].id;
  }

  await createSession(userId);
  return NextResponse.json({ ok: true });
}
