import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";

export default async function YuklerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/");

  return (
    <main style={{ maxWidth: 480, margin: "0 auto", padding: "52px 16px 32px" }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
        Yüklerim
      </h1>
      <p style={{ color: "var(--muted)", marginTop: 8 }}>
        Giriş yaptın: {user.phone}
      </p>
      <p style={{ color: "var(--muted)", fontSize: 14, marginTop: 24 }}>
        Bu ekranın gerçek hali (güzergaha uyan yükler, WhatsApp sohbeti gibi sıralı liste) bir sonraki adımda gelecek.
      </p>
    </main>
  );
}
