"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import type { Route } from "@/app/api/routes/list/route";

export default function GuzergahlarimPage() {
  const [routes, setRoutes] = useState<Route[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setError(null);
    const res = await fetch("/api/routes/list");
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Bir şeyler ters gitti");
      return;
    }
    setRoutes(data.routes);
  }

  useEffect(() => {
    load();
  }, []);

  async function toggle(id: string, isActive: boolean) {
    setRoutes((prev) => prev?.map((r) => (r.id === id ? { ...r, is_active: isActive } : r)) ?? prev);
    const res = await fetch("/api/routes/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, isActive }),
    });
    if (!res.ok) load();
  }

  async function remove(id: string) {
    if (!confirm("Bu güzergahı silmek istediğine emin misin?")) return;
    setRoutes((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    await fetch("/api/routes/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "52px 16px 32px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>Güzergahlarım</h1>
        <Link
          href="/guzergahlarim/form"
          style={{
            height: 40,
            padding: "0 14px",
            borderRadius: 20,
            background: "var(--accent)",
            color: "var(--on-accent)",
            fontSize: 14,
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            textDecoration: "none",
          }}
        >
          + Ekle
        </Link>
      </div>

      {error && <p style={{ color: "var(--danger)", marginTop: 12 }}>{error}</p>}
      {routes === null && !error && <p style={{ color: "var(--muted)", marginTop: 16 }}>Yükleniyor…</p>}
      {routes?.length === 0 && (
        <p style={{ color: "var(--muted)", marginTop: 16 }}>Henüz güzergahın yok. &quot;+ Ekle&quot; ile başla.</p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 16 }}>
        {routes?.map((r) => (
          <article
            key={r.id}
            style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 16, padding: "14px 16px" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ fontSize: 18, fontWeight: 800 }}>
                {r.from_il}
                {r.from_ilce ? ` / ${r.from_ilce}` : ""} → {r.to_il}
                {r.to_ilce ? ` / ${r.to_ilce}` : ""}
              </div>
              <button
                type="button"
                aria-pressed={r.is_active}
                onClick={() => toggle(r.id, !r.is_active)}
                style={{
                  width: 44,
                  height: 28,
                  borderRadius: 14,
                  border: 0,
                  background: r.is_active ? "var(--teal)" : "var(--border)",
                  position: "relative",
                  flexShrink: 0,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 3,
                    left: r.is_active ? 20 : 3,
                    width: 22,
                    height: 22,
                    borderRadius: "50%",
                    background: "var(--on-primary)",
                  }}
                />
              </button>
            </div>
            <div style={{ fontSize: 13, color: "var(--muted)", marginTop: 4 }}>
              {r.include_return ? "Dönüş yükleri açık" : "Sadece gidiş yönü"}
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <Link
                href={`/guzergahlarim/form?id=${r.id}`}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: "1.5px solid var(--primary)",
                  color: "var(--primary)",
                  fontSize: 14,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textDecoration: "none",
                }}
              >
                Düzenle
              </Link>
              <button
                type="button"
                onClick={() => remove(r.id)}
                style={{
                  flex: 1,
                  height: 40,
                  borderRadius: 10,
                  border: "1.5px solid var(--danger)",
                  background: "transparent",
                  color: "var(--danger)",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                Sil
              </button>
            </div>
          </article>
        ))}
      </div>

      <Link href="/yukler" style={{ display: "inline-block", marginTop: 24, color: "var(--teal)", fontWeight: 600, fontSize: 14 }}>
        ← Yüklerim&apos;e dön
      </Link>
    </main>
  );
}
