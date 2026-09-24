"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { readCampaign, refToLocalPhone } from "@/lib/campaign";

export default function GirisPage() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const campaign = readCampaign();
    if (campaign?.ref) {
      const local = refToLocalPhone(campaign.ref);
      if (local) setPhone(local);
    }
  }, []);

  async function submit() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/send-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Bir şeyler ters gitti");
        return;
      }
      const qs = data.devCode ? `?dev=${data.devCode}` : "";
      router.push(`/kod?phone=${encodeURIComponent(phone)}${qs}`);
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
        padding: "56px 16px 32px",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 800, letterSpacing: "-0.03em" }}>
          götür<span style={{ color: "var(--teal)" }}>.</span>
          <span style={{ color: "var(--steel)" }}>tr</span>
        </div>
      </div>

      <div style={{ marginTop: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
          Telefon numaranla giriş yap
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 15, lineHeight: 1.4 }}>
          Kod WhatsApp&apos;a gelir. Şifre yok, hesap açma formu yok.
        </p>

        <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
          <div
            style={{
              width: 64,
              height: 56,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 700,
            }}
          >
            +90
          </div>
          <input
            type="tel"
            inputMode="tel"
            placeholder="5XX XXX XX XX"
            aria-label="Telefon numarası"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            style={{
              flex: 1,
              minWidth: 0,
              height: 56,
              borderRadius: 12,
              border: "1px solid var(--border)",
              background: "var(--surface)",
              padding: "0 14px",
              fontSize: 18,
              fontWeight: 600,
              color: "var(--text)",
              outline: "none",
            }}
          />
        </div>

        {error && (
          <p style={{ color: "var(--danger)", fontSize: 14, marginTop: 8 }}>{error}</p>
        )}

        <button
          type="button"
          disabled={loading || phone.trim().length < 10}
          onClick={submit}
          style={{
            marginTop: 12,
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
          {loading ? "Gönderiliyor…" : "Kod Gönder"}
        </button>

        <p style={{ marginTop: 14, textAlign: "center", color: "var(--teal)", fontWeight: 600, fontSize: 14 }}>
          İlk 10 gün ücretsiz, kart gerekmez
        </p>
      </div>
    </main>
  );
}
