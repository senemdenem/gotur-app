"use client";

import { Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { writeCampaign, trackEvent } from "@/lib/campaign";

function Tracker() {
  const params = useSearchParams();

  useEffect(() => {
    const ref = params.get("ref");
    const source = params.get("source");
    if (!ref) return;
    writeCampaign({ ref, source });
    trackEvent("LINK_CLICKED", ref, source, { once: true });
  }, [params]);

  return null;
}

export default function CampaignTracker() {
  return (
    <Suspense fallback={null}>
      <Tracker />
    </Suspense>
  );
}
