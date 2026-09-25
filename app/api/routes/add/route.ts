import { NextRequest, NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";
import { getSessionToken } from "@/lib/session";

export async function POST(req: NextRequest) {
  const token = await getSessionToken();
  if (!token) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const fromIl = String(body?.fromIl ?? "").trim();
  const toIl = String(body?.toIl ?? "").trim();
  if (!fromIl || !toIl) {
    return NextResponse.json({ error: "Nereden ve nereye zorunlu" }, { status: 400 });
  }

  const { status, body: result } = await callN8n<{ id?: string }>("gotur/routes/add", {
    token,
    fromIl,
    fromIlce: body?.fromIlce || null,
    toIl,
    toIlce: body?.toIlce || null,
    includeReturn: !!body?.includeReturn,
  });
  if (!result.ok) return NextResponse.json({ error: "Güzergah eklenemedi" }, { status: status || 400 });
  return NextResponse.json({ ok: true, id: result.id });
}
