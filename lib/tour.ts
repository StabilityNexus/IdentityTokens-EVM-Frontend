/** `data-tour` values, shared by the tour and the elements it highlights. */
export const TOUR_TARGETS = {
  navDashboard: "nav-dashboard",
  navHome: "nav-home",
  navDiscover: "nav-discover",
  createProfile: "create-profile",
  newToken: "new-token",
  walletCenter: "wallet-center",
} as const;

export type TourTarget = (typeof TOUR_TARGETS)[keyof typeof TOUR_TARGETS];

export interface TourStep {
  /** Route the target lives on; the tour navigates there first. */
  route: string;
  target: TourTarget;
  title: string;
  description: string;
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Sidebar targets are off-canvas on mobile until the drawer is opened. */
  inSidebar?: boolean;
}

export const TOUR_STEPS: TourStep[] = [
  {
    route: "/dashboard",
    target: TOUR_TARGETS.navDashboard,
    title: "Your dashboard",
    description:
      "Your identity at a glance — trust score, the tokens you hold and the attestations behind them.",
    side: "right",
    align: "start",
    inSidebar: true,
  },
  {
    route: "/dashboard",
    target: TOUR_TARGETS.createProfile,
    title: "Create your profile",
    description:
      "Mint a public profile token so other people can find you, see your links and attest to you.",
    side: "bottom",
    align: "end",
  },
  {
    route: "/dashboard",
    target: TOUR_TARGETS.walletCenter,
    title: "Wallet Center",
    description:
      "Copy your address, switch wallet or network, and open your identity on the block explorer.",
    side: "bottom",
    align: "end",
  },
  {
    route: "/dashboard",
    target: TOUR_TARGETS.navHome,
    title: "Home",
    description:
      "Your token workspace — every credential you have minted is listed here.",
    side: "right",
    align: "start",
    inSidebar: true,
  },
  {
    route: "/home",
    target: TOUR_TARGETS.newToken,
    title: "New Token",
    description:
      "Mint a credential token — an email, a GitHub handle, a degree, it can be anything so that others can attest to it.",
    side: "bottom",
    align: "end",
  },
  {
    route: "/home",
    target: TOUR_TARGETS.navDiscover,
    title: "Search anything",
    description:
      "Discover searches by profile, token and decentralized ID, so you can look anyone up and attest what you can vouch for.",
    side: "right",
    align: "start",
    inSidebar: true,
  },
];

/** CSS selector for a step's target element. */
export function tourSelector(target: TourTarget): string {
  return `[data-tour="${target}"]`;
}
