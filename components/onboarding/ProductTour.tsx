"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { driver, type DriveStep, type Driver } from "driver.js";
import { animate } from "framer-motion";
import {
  consumeTourPending,
  hasSeenTour,
  markTourSeen,
} from "@/lib/onboarding";
import { TOUR_STEPS, tourSelector } from "@/lib/tour";
import "driver.js/dist/driver.css";

const MOBILE_BREAKPOINT = 1024; // matches the sidebar's `lg:` breakpoint
const SIDEBAR_TRANSITION_MS = 320;

/** Drive the mobile drawer through the same event the hamburger uses. */
function setMobileSidebar(open: boolean) {
  if (typeof window === "undefined") return;
  if (window.innerWidth >= MOBILE_BREAKPOINT) return;

  // Deferred a frame: on first mount this component's effect runs before the
  // sidebar's, so a synchronous dispatch would land with nothing listening.
  window.requestAnimationFrame(() => {
    document.dispatchEvent(
      new CustomEvent("openMobileSidebar", { detail: { open } })
    );
  });
}

/** Read a design token so the overlay is not a second source of truth. */
function cssToken(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
  return value || fallback;
}

/** Post-onboarding tour; `?tour=1` always runs it, and replays it on demand. */
export function ProductTour() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const isRequestedByUrl = searchParams?.get("tour") === "1";

  const driverRef = useRef<Driver | null>(null);
  const refreshTimer = useRef<number | null>(null);
  // Destroying on unmount must not count as "the user has seen the tour".
  const isUnmounting = useRef(false);
  // Run once per mount, and remember the queued flag across dev remounts.
  const hasRun = useRef(false);
  const wasQueued = useRef(false);

  // Hooks that the driver callbacks read at click time, not at setup time.
  const routerRef = useRef(router);
  const pathnameRef = useRef(pathname);
  useEffect(() => {
    routerRef.current = router;
    pathnameRef.current = pathname;
  }, [router, pathname]);

  useEffect(() => {
    if (driverRef.current) return;

    // Clear the queued hand-off whichever trigger fires, so it cannot replay.
    wasQueued.current = consumeTourPending() || wasQueued.current;

    // A URL request always wins, including a replay from the help button.
    // The queued flag runs once a mount and defers to "already seen".
    if (!isRequestedByUrl) {
      if (hasRun.current || !wasQueued.current || hasSeenTour()) return;
    }

    hasRun.current = true;

    const clearRefresh = () => {
      if (refreshTimer.current === null) return;
      window.clearTimeout(refreshTimer.current);
      refreshTimer.current = null;
    };

    // Re-measure the stage once the drawer has finished animating in.
    const refreshAfterSidebar = () => {
      if (window.innerWidth >= MOBILE_BREAKPOINT) return;
      clearRefresh();
      refreshTimer.current = window.setTimeout(() => {
        refreshTimer.current = null;
        driverRef.current?.refresh();
      }, SIDEBAR_TRANSITION_MS);
    };

    const steps: DriveStep[] = TOUR_STEPS.map((step) => ({
      element: tourSelector(step.target),
      popover: {
        title: step.title,
        description: step.description,
        side: step.side,
        align: step.align,
      },
      onHighlightStarted: () => {
        setMobileSidebar(!!step.inSidebar);
        if (step.inSidebar) refreshAfterSidebar();
      },
    }));

    /** Move one step, navigating first when the next one is on another route. */
    const step = (direction: 1 | -1) => {
      const instance = driverRef.current;
      if (!instance) return;

      const index = instance.getActiveIndex() ?? 0;
      const target = TOUR_STEPS[index + direction];
      if (!target) {
        instance.destroy();
        return;
      }

      if (target.route !== pathnameRef.current) {
        routerRef.current.push(target.route);
      }
      // `waitForElement` covers the gap until the new route paints.
      if (direction === 1) instance.moveNext();
      else instance.movePrevious();
    };

    const instance = driver({
      steps,
      showProgress: true,
      showButtons: ["next", "previous", "close"],
      nextBtnText: "Next",
      prevBtnText: "Back",
      doneBtnText: "Finish",
      popoverClass: "dit-tour-popover",
      overlayColor: cssToken("--color-dark-bg", "#101115"),
      overlayOpacity: 0.72,
      stagePadding: 8,
      stageRadius: 12,
      smoothScroll: true,
      // Read-only walkthrough: a click would open a modal over the popover.
      disableActiveInteraction: true,
      waitForElement: 4000,
      skipMissingElement: true,
      onNextClick: () => step(1),
      onPrevClick: () => step(-1),
      onPopoverRender: (popover) => {
        animate(
          popover.wrapper,
          { opacity: [0, 1], scale: [0.94, 1], y: [8, 0] },
          { duration: 0.28, ease: [0.16, 1, 0.3, 1] }
        );
      },
      onDestroyed: () => {
        clearRefresh();
        setMobileSidebar(false);
        driverRef.current = null;
        if (!isUnmounting.current) markTourSeen();
      },
    });

    driverRef.current = instance;
    instance.drive();

    // Drop the flag so a refresh or back-navigation does not replay the tour.
    if (isRequestedByUrl) router.replace(pathname, { scroll: false });
  }, [isRequestedByUrl, router, pathname]);

  // Leaving the dashboard takes the overlay with it, without recording it seen.
  useEffect(
    () => () => {
      isUnmounting.current = true;
      driverRef.current?.destroy();
      // Cleared here, not in `onDestroyed`: driver.js skips that hook when it
      // is torn down before the first highlight lands, which would otherwise
      // leave a dead instance blocking every later start.
      driverRef.current = null;
      isUnmounting.current = false;
      hasRun.current = false; // dev remounts the layout; allow a restart
    },
    []
  );

  return null;
}

export default ProductTour;
