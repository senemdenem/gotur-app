"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function KodForm() {
  const router = useRouter();
  const params = useSearchParams();
  const phone = params.get("phone") ?? "";
  const devCode = params.get("dev");
  const [code, setCode] = useState(devCode ?? "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti");
        return;
      }
      router.push("/yukler");
    } catch {
      setError("Sunucuya ulaşılamadı");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      style={{
        minHeight: "100dvh",
        display: "flex",
        flexDirection: "column",
        maxWidth: 480,
        margin: "0 auto",
        padding: "52px 16px 32px",
      }}
    >
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
        Kodu gir
      </h1>
      <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.5, marginTop: 10 }}>
        {phone} numarasına WhatsApp&apos;tan 6 haneli bir kod gönderdik.
      </p>
      {devCode && (
        <p style={{ color: "var(--accent)", fontSize: 13, marginTop: 8 }}>
          Geliştirme modu: kod otomatik dolduruldu ({devCode})
        </p>
      )}

      <input
        type="text"
        inputMode="numeric"
        maxLength={6}
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ""))}
        aria-label="Doğrulama kodu"
        style={{
          marginTop: 24,
          height: 60,
          borderRadius: 12,
          border: "1px solid var(--border)",
          background: "var(--surface)",
          textAlign: "center",
          fontSize: 24,
          fontWeight: 800,
          letterSpacing: "0.3em",
          color: "var(--text)",
          outline: "none",
        }}
      />

      {error && <p style={{ color: "var(--danger)", fontSize: 14, marginTop: 8 }}>{error}</p>}

      <button
        type="button"
        disabled={loading || code.length !== 6}
        onClick={submit}
        style={{
          marginTop: "auto",
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
        {loading ? "Doğrulanıyor…" : "Giriş Yap"}
      </button>
    </main>
  );
}

export default function KodPage() {
  return (
    <Suspense fallback={null}>
      <KodForm />
    </Suspense>
  );
}
