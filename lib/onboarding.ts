import { readKey, removeKey, writeKey } from "./storage";

/** Bump when the terms text changes so previous acceptances are re-asked. */
export const TERMS_VERSION = "1.0";

/** Bump alongside the tour steps to re-run the tour for returning users. */
export const TOUR_VERSION = "1";

const TERMS_KEY_PREFIX = "dit:terms:";
const TOUR_DONE_KEY = `dit:tour:v${TOUR_VERSION}:done`;
const TOUR_PENDING_KEY = `dit:tour:v${TOUR_VERSION}:pending`;

const termsKey = (address: string) =>
  `${TERMS_KEY_PREFIX}v${TERMS_VERSION}:${address.toLowerCase()}`;

/** Has this wallet already accepted the current terms in this browser? */
export function hasAcceptedTerms(address: string | undefined): boolean {
  if (!address) return false;
  return !!readKey(termsKey(address));
}

/** Record acceptance of the current terms for a wallet. */
export function recordTermsAcceptance(address: string): void {
  writeKey(termsKey(address), new Date().toISOString());
}

/** Has the product tour already run to completion (or been dismissed)? */
export function hasSeenTour(): boolean {
  return readKey(TOUR_DONE_KEY) === "1";
}

/** Remember that the tour finished so it does not reopen on every visit. */
export function markTourSeen(): void {
  writeKey(TOUR_DONE_KEY, "1");
}

/** Queue the tour for the next dashboard visit, in case `?tour=1` is lost. */
export function markTourPending(): void {
  writeKey(TOUR_PENDING_KEY, "1");
}

/** Read the queued tour and clear it, so it only ever fires once. */
export function consumeTourPending(): boolean {
  const pending = readKey(TOUR_PENDING_KEY) === "1";
  if (pending) removeKey(TOUR_PENDING_KEY);
  return pending;
}
