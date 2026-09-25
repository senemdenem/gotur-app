"use client";

import { useEffect, useState } from "react";
import { readCampaign, getInstallSnoozedUntil, snoozeInstallPrompt, trackEvent } from "@/lib/campaign";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  const mm = window.matchMedia?.("(display-mode: standalone)").matches;
  const iosStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
  // manifest start_url'deki launch=app işareti: bazı Android WebView senaryolarında
  // matchMedia gecikebiliyor, bu ek sinyal onu telafi eder.
  const launchFlag = new URLSearchParams(window.location.search).get("launch") === "app";
  return !!mm || !!iosStandalone || launchFlag;
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

/** Android/Huawei/HarmonyOS gibi mobil taray\u0131c\u0131lar\u0131 kapsar; iOS hari\u00e7. */
function isLikelyMobileNonIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  return /android|huawei|harmonyos|mobile/i.test(navigator.userAgent) && !isIOS();
}

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showAndroid, setShowAndroid] = useState(false);
  const [showIOS, setShowIOS] = useState(false);
  const [showGeneric, setShowGeneric] = useState(false);

  useEffect(() => {
    if (isStandalone()) {
      const campaign = readCampaign();
      if (campaign?.ref) {
        trackEvent("PWA_INSTALLED", campaign.ref, campaign.source, { once: true });
      }
      return;
    }

    if (Date.now() < getInstallSnoozedUntil()) return;

    let promptFired = false;

    function onBeforeInstallPrompt(e: Event) {
      promptFired = true;
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShowAndroid(true);
    }
    window.addEventListener("beforeinstallprompt", onBeforeInstallPrompt);

    if (isIOS()) {
      setShowIOS(true);
    } else if (isLikelyMobileNonIOS()) {
      // Chrome/Android'de beforeinstallprompt genelde hemen gelir; Huawei tarayıcısı
      // (ve bazı diğer Android tarayıcıları) bu event'i hiç tetiklemez. Kısa bir süre
      // bekleyip gelmediyse tarayıcı menüsünden ekleme rehberine düş.
      const timer = window.setTimeout(() => {
        if (!promptFired) setShowGeneric(true);
      }, 2500);
      return () => {
        window.clearTimeout(timer);
        window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
      };
    }

    return () => window.removeEventListener("beforeinstallprompt", onBeforeInstallPrompt);
  }, []);

  function dismiss() {
    snoozeInstallPrompt(24);
    setShowAndroid(false);
    setShowIOS(false);
    setShowGeneric(false);
  }

  async function installAndroid() {
    if (!deferred) return;
    await deferred.prompt();
    setShowAndroid(false);
  }

  if (showAndroid) {
    return (
      <div
        role="dialog"
        aria-label="Uygulamayı yükle"
        style={{
          position: "fixed",
          left: 12,
          right: 12,
          bottom: 12,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          gap: 10,
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 16,
          padding: "10px 12px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/icons/icon-192.png" alt="" width={40} height={40} style={{ borderRadius: 10, flexShrink: 0 }} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 800, fontSize: 15 }}>Götür.tr&apos;yi yükle</div>
          <div style={{ fontSize: 13, color: "var(--muted)" }}>Ana ekrana ekle, bildirimleri kaçırma</div>
        </div>
        <button
          type="button"
          onClick={installAndroid}
          style={{
            height: 36,
            padding: "0 14px",
            borderRadius: 10,
            border: 0,
            background: "var(--primary)",
            color: "var(--on-primary)",
            fontWeight: 700,
            fontSize: 14,
            flexShrink: 0,
          }}
        >
          Yükle
        </button>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Kapat"
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            border: 0,
            background: "var(--surface-2)",
            color: "var(--muted)",
            flexShrink: 0,
          }}
        >
          ✕
        </button>
      </div>
    );
  }

  if (showIOS) {
    return (
      <div
        role="dialog"
        aria-label="Ana ekrana ekle"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          background: "var(--surface)",
          borderRadius: "20px 20px 0 0",
          padding: "18px 20px 24px",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.22)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Ana Ekrana Ekle</div>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
          1. Alttaki <b>Paylaş</b> ikonuna dokun
          <br />
          2. <b>Ana Ekrana Ekle</b>&apos;yi seç
        </p>
        <button
          type="button"
          onClick={dismiss}
          style={{
            marginTop: 14,
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: 0,
            background: "var(--primary)",
            color: "var(--on-primary)",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          Anladım
        </button>
      </div>
    );
  }

  if (showGeneric) {
    return (
      <div
        role="dialog"
        aria-label="Ana ekrana ekle"
        style={{
          position: "fixed",
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 50,
          background: "var(--surface)",
          borderRadius: "20px 20px 0 0",
          padding: "18px 20px 24px",
          boxShadow: "0 -8px 24px rgba(0,0,0,0.22)",
        }}
      >
        <div style={{ fontWeight: 800, fontSize: 16, marginBottom: 6 }}>Ana Ekrana Ekle</div>
        <p style={{ fontSize: 14, color: "var(--muted)", lineHeight: 1.55, margin: 0 }}>
          Tarayıcının sağ üst köşesindeki menüye (⋮) dokun, ardından{" "}
          <b>Ana ekrana ekle</b> veya <b>Kısayol oluştur</b> seçeneğini seç.
        </p>
        <button
          type="button"
          onClick={dismiss}
          style={{
            marginTop: 14,
            width: "100%",
            height: 48,
            borderRadius: 12,
            border: 0,
            background: "var(--primary)",
            color: "var(--on-primary)",
            fontWeight: 800,
            fontSize: 15,
          }}
        >
          Anladım
        </button>
      </div>
    );
  }

  return null;
}
