import localFont from "next/font/local";

export const atypFont = localFont({
  src: [
    {
      path: "../public/fonts/AtypDisplayTRIAL-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-atyp",
  display: "swap",
});

export const garamondFont = localFont({
  src: [
    {
      path: "../public/fonts/Garamond.woff2",
      weight: "400",
      style: "italic",
    },
  ],
  variable: "--font-garamond",
  display: "swap",
});

export const utsahaFont = localFont({
  src: [
    {
      path: "../public/fonts/UtSaHaGumm.woff2",
      weight: "400",
      style: "normal",
    },
  ],
  variable: "--font-utsaha",
  display: "swap",
});

// Keep layout usage unchanged while avoiding remote Google font fetches.
export const comfortaaFont = {
  variable: "",
} as const;
