import { NextRequest, NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const id = String(body?.id ?? "");
  const fromIl = String(body?.fromIl ?? "").trim();
  const toIl = String(body?.toIl ?? "").trim();
  if (!id || !fromIl || !toIl) {
    return NextResponse.json({ error: "Nereden ve nereye zorunlu" }, { status: 400 });
  }

  const { status, body: result } = await callN8n("gotur/routes/edit", {
    token,
    id,
    fromIl,
    fromIlce: body?.fromIlce || null,
    toIl,
    toIlce: body?.toIlce || null,
    includeReturn: !!body?.includeReturn,
  });
  if (!result.ok) return NextResponse.json({ error: "Güncellenemedi" }, { status: status || 400 });
  return NextResponse.json({ ok: true });
}
