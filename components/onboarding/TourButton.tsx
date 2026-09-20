"use client";

import { useRouter } from "next/navigation";
import { CircleHelp } from "lucide-react";

/** Restarts the product tour for anyone who closed it by mistake. */
export function TourButton({ className = "" }: { className?: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      // Step one lives on the dashboard, and `?tour=1` always starts the tour.
      onClick={() => router.push("/dashboard?tour=1")}
      aria-label="Take the product tour"
      title="Take the product tour"
      className={`absolute right-5 bottom-5 z-30 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-panel-bg text-white/70 shadow-lg transition-all duration-200 hover:scale-105 hover:bg-white/10 hover:text-white active:scale-95 ${className}`}
    >
      <CircleHelp size={20} />
    </button>
  );
}

export default TourButton;
