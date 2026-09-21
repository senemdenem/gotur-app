import { NextRequest, NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? "");
  if (!phone) {
    return NextResponse.json({ error: "Geçersiz telefon numarası" }, { status: 400 });
  }

  try {
    const { status, body: result } = await callN8n<{ devCode?: string }>("gotur/auth/send-code", {
      phone,
    });
    if (!result.ok) {
      const message =
        result.error === "rate_limited"
          ? "Çok sık istek. Birazdan tekrar dene."
          : "Geçersiz telefon numarası";
      return NextResponse.json({ error: message }, { status: status || 400 });
    }
    return NextResponse.json({ ok: true, devCode: result.devCode });
  } catch (e) {
    return NextResponse.json({ error: "Sunucu hatası, birazdan tekrar dene." }, { status: 500 });
  }
}
