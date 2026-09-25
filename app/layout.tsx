import type { Metadata, Viewport } from "next";
import "./globals.css";
import CampaignTracker from "@/components/CampaignTracker";
import InstallPrompt from "@/components/InstallPrompt";
import UpdateToast from "@/components/UpdateToast";

export const metadata: Metadata = {
  title: "götür.tr",
  description: "Yükün seni bulsun — şoförler için akıllı yük bildirim uygulaması",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16.png", sizes: "16x16", type: "image/png" },
    ],
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Götür.tr",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F3F8FA" },
    { media: "(prefers-color-scheme: dark)", color: "#0C1B2A" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="tr">
      <body>
        <CampaignTracker />
        <UpdateToast />
        {children}
        <InstallPrompt />
      </body>
    </html>
  );
}
