// Next.js API rotaları Postgres'e doğrudan bağlanmıyor. Oracle sunucusundaki
// Postgres dışarıya hiç açılmıyor; açılış n8n webhook'ları üzerinden yapılıyor
// (n8n zaten aynı Docker ağında çalışıyor). Bu dosya o webhook'lara HTTP
// çağrısı atan küçük bir istemci.
//
// Gerekli Vercel ortam değişkenleri:
//   N8N_WEBHOOK_BASE   -> ör. https://n8n.kokner.xyz/webhook
//   N8N_WEBHOOK_SECRET -> n8n workflow'larındaki x-gotur-secret ile aynı değer

type N8nResult<T> = { status: number; body: T & { ok: boolean; error?: string } };

export async function callN8n<T = Record<string, unknown>>(
  path: string,
  payload: Record<string, unknown>
): Promise<N8nResult<T>> {
  const base = process.env.N8N_WEBHOOK_BASE;
  const secret = process.env.N8N_WEBHOOK_SECRET;
  if (!base || !secret) {
    throw new Error(
      "N8N_WEBHOOK_BASE / N8N_WEBHOOK_SECRET tanımlı değil. Vercel proje ayarlarına eklemek gerekiyor."
    );
  }
  const res = await fetch(`${base}/${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-gotur-secret": secret,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({ ok: false, error: "invalid_response" }))) as T & {
    ok: boolean;
    error?: string;
  };
  return { status: res.status, body };
}
