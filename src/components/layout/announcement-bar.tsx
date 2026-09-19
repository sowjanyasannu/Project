"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { X } from "lucide-react";

const DISMISS_KEY = "jobert_announcement_dismissed_v1";

function subscribe() {
  return () => {};
}

function isDismissed() {
  try {
    return localStorage.getItem(DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

function getServerSnapshot() {
  return false;
}

export function AnnouncementBar() {
  const persistedDismissed = useSyncExternalStore(subscribe, isDismissed, getServerSnapshot);
  const [dismissedLocally, setDismissedLocally] = useState(false);

  if (persistedDismissed || dismissedLocally) return null;

  function dismiss() {
    setDismissedLocally(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  }

  return (
    <div className="relative bg-brand-navy text-white">
      <div className="container-app flex items-center justify-center gap-2 py-2 pr-8 text-center text-xs font-medium sm:text-sm">
        <span>
          Bulk orders for schools &amp; teams get priority turnaround —{" "}
          <Link href="/bulk-orders" className="underline underline-offset-2 hover:no-underline">
            Request a quote
          </Link>
        </span>
      </div>
      <button
        onClick={dismiss}
        aria-label="Dismiss announcement"
        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="size-3.5" />
      </button>
    </div>
  );
}
