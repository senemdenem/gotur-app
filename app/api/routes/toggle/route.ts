import { NextRequest, NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  if (!id) return NextResponse.json({ error: "Geçersiz istek" }, { status: 400 });

  const { status, body: result } = await callN8n("gotur/routes/toggle", {
    token,
    id,
    isActive: !!body?.isActive,
  });
  if (!result.ok) return NextResponse.json({ error: "Güncellenemedi" }, { status: status || 400 });
  return NextResponse.json({ ok: true });
}
