"use client";

import { useEffect, useState } from "react";

/**
 * Serwist skipWaiting+clientsClaim ile güncellemeleri zaten otomatik uyguluyor
 * (kullanıcı bir şey yapmadan, bir sonraki açılışta yeni sürüm devrede olur).
 * Bu bileşen sadece uygulama AÇIKKEN arka planda bir güncelleme inerse
 * kullanıcıya kısa bir bilgi verip sayfayı tazelemesini öneriyor.
 */
export default function UpdateToast() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator)) return;

    function onControllerChange() {
      setShow(true);
      window.setTimeout(() => setShow(false), 6000);
    }
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    return () => navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
  }, []);

  if (!show) return null;

  return (
    <div
      role="status"
      style={{
        position: "fixed",
        left: 12,
        right: 12,
        top: "calc(env(safe-area-inset-top, 0px) + 12px)",
        zIndex: 60,
        display: "flex",
        alignItems: "center",
        gap: 10,
        background: "var(--surface)",
        border: "1px solid var(--border)",
        borderRadius: 14,
        padding: "10px 14px",
        boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
      }}
    >
      <span style={{ color: "var(--teal)", fontSize: 18 }}>✓</span>
      <span style={{ flex: 1, fontSize: 14, fontWeight: 700 }}>Yeni sürüm yüklendi</span>
      <button
        type="button"
        onClick={() => window.location.reload()}
        style={{
          height: 32,
          padding: "0 12px",
          borderRadius: 8,
          border: 0,
          background: "var(--primary)",
          color: "var(--on-primary)",
          fontWeight: 700,
          fontSize: 13,
        }}
      >
        Yenile
      </button>
    </div>
  );
}
