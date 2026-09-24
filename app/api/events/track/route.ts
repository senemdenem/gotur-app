import { NextRequest, NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const phone = String(body?.phone ?? "").trim();
  const event = String(body?.event ?? "").trim();
  if (!phone || !event) {
    return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });
  }
  try {
    await callN8n("gotur/events/track", {
      phone,
      event,
      source: body?.source ?? null,
    });
  } catch {
    // Takip event'i kritik akışı bozmasın; sessizce yut.
  }
  return NextResponse.json({ ok: true });
}
