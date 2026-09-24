"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "@/app/api/routes/list/route";

function Form() {
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("id");

  const [fromIl, setFromIl] = useState("");
  const [fromIlce, setFromIlce] = useState("");
  const [toIl, setToIl] = useState("");
  const [toIlce, setToIlce] = useState("");
  const [includeReturn, setIncludeReturn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(!editId);

  useEffect(() => {
    if (!editId) return;
    fetch("/api/routes/list")
      .then((r) => r.json())
      .then((data) => {
        const r = (data.routes as Route[] | undefined)?.find((x) => x.id === editId);
        if (r) {
          setFromIl(r.from_il);
          setFromIlce(r.from_ilce ?? "");
          setToIl(r.to_il);
          setToIlce(r.to_ilce ?? "");
          setIncludeReturn(r.include_return);
        }
        setLoaded(true);
      });
  }, [editId]);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch(editId ? "/api/routes/edit" : "/api/routes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editId, fromIl, fromIlce, toIl, toIlce, includeReturn }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti");
        return;
      }
      router.push("/guzergahlarim");
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    flex: 1,
    minWidth: 0,
    height: 52,
    borderRadius: 12,
    border: "1px solid var(--border)",
    background: "var(--surface)",
    padding: "0 14px",
    fontSize: 16,
    fontWeight: 500,
    color: "var(--text)",
    outline: "none",
  };
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: "var(--muted)" };

  if (!loaded) return null;

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "52px 16px 32px", display: "flex", flexDirection: "column" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
        {editId ? "Güzergahı Düzenle" : "Güzergah Ekle"}
      </h1>

      <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={labelStyle}>Nereden</span>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={inputStyle} placeholder="İl" value={fromIl} onChange={(e) => setFromIl(e.target.value)} />
          <input style={inputStyle} placeholder="İlçe (opsiyonel)" value={fromIlce} onChange={(e) => setFromIlce(e.target.value)} />
        </div>
      </div>

      <div style={{ marginTop: 14, display: "flex", flexDirection: "column", gap: 6 }}>
        <span style={labelStyle}>Nereye</span>
        <div style={{ display: "flex", gap: 10 }}>
          <input style={inputStyle} placeholder="İl" value={toIl} onChange={(e) => setToIl(e.target.value)} />
          <input style={inputStyle} placeholder="İlçe (opsiyonel)" value={toIlce} onChange={(e) => setToIlce(e.target.value)} />
        </div>
      </div>

      <label
        style={{
          marginTop: 16,
          display: "flex",
          alignItems: "center",
          gap: 12,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 14,
          padding: "12px 14px",
        }}
      >
        <input type="checkbox" checked={includeReturn} onChange={(e) => setIncludeReturn(e.target.checked)} style={{ width: 20, height: 20 }} />
        <span>
          <span style={{ display: "block", fontSize: 15, fontWeight: 700 }}>Dönüş yükleri de gelsin</span>
          <span style={{ display: "block", fontSize: 13, color: "var(--muted)" }}>Ters yöndeki yükleri de bildir</span>
        </span>
      </label>

      {error && <p style={{ color: "var(--danger)", fontSize: 14, marginTop: 12 }}>{error}</p>}

      <button
        type="button"
        disabled={loading || !fromIl.trim() || !toIl.trim()}
        onClick={submit}
        style={{
          marginTop: 20,
          width: "100%",
          height: 56,
          borderRadius: 14,
          border: 0,
          background: "var(--primary)",
          color: "var(--on-primary)",
          fontSize: 17,
          fontWeight: 800,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? "Kaydediliyor…" : "Güzergahı Kaydet"}
      </button>
    </main>
  );
}

export default function GuzergahFormPage() {
  return (
    <Suspense fallback={null}>
      <Form />
    </Suspense>
  );
}
