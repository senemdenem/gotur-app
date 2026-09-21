export default function GirisPage() {
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

        <button
          type="button"
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
          }}
        >
          Kod Gönder
        </button>

        <p style={{ marginTop: 14, textAlign: "center", color: "var(--teal)", fontWeight: 600, fontSize: 14 }}>
          İlk 10 gün ücretsiz, kart gerekmez
        </p>
      </div>
    </main>
  );
}
