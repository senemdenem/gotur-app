import { NextRequest, NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";
import { setSessionCookie } from "@/lib/session";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? "");
  const code = String(body?.code ?? "").trim();
  if (!phone || code.length !== 6) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }

  try {
    const { status, body: result } = await callN8n<{
      userId?: string;
      sessionToken?: string;
      expiresAt?: string;
    }>("gotur/auth/verify-code", { phone, code });

    if (!result.ok || !result.sessionToken || !result.expiresAt) {
      return NextResponse.json({ error: result.error ?? "Doğrulama başarısız" }, { status: status || 400 });
    }

    await setSessionCookie(result.sessionToken, result.expiresAt);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Sunucu hatası, birazdan tekrar dene." }, { status: 500 });
  }
}
