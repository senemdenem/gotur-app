import { NextResponse } from "next/server";
import { callN8n } from "@/lib/n8n";
import { getSessionToken } from "@/lib/session";

export type Route = {
  id: string;
  from_il: string;
  from_ilce: string | null;
  to_il: string;
  to_ilce: string | null;
  include_return: boolean;
  is_active: boolean;
  created_at: string;
};

export async function GET() {
  const token = getSessionToken();
  if (!token) return NextResponse.json({ error: "Giriş gerekli" }, { status: 401 });

  const { status, body } = await callN8n<{ routes: Route[] }>("gotur/routes/list", { token });
  if (!body.ok) return NextResponse.json({ error: "Güzergahlar alınamadı" }, { status: status || 400 });
  return NextResponse.json({ ok: true, routes: body.routes ?? [] });
}
