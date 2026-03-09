"use client";

import Image from "next/image";
import { useTypewriter } from "@/hooks/useTypewriter";
import { HERO_WORDS } from "@/lib/constants";

export default function Hero() {
  const displayedText = useTypewriter(HERO_WORDS);

  return (
    <section className="relative flex min-h-screen w-full flex-col items-center bg-landing-bg dark:bg-landing-bg-dark">
      {/* Spacer for Fixed Navbar */}
      <div className="h-16 w-full flex-shrink-0 md:h-[80px]" />

      {/* Main Content Container */}
      <div
        className="relative mx-4 mt-4 flex w-full max-w-[1400px] flex-col items-center gap-8 overflow-hidden rounded-[28px] border border-corner-stroke/80 bg-slate-white/20 p-6 md:mx-[56px] md:mt-[19px] md:w-[calc(100%-112px)] md:flex-row md:gap-12 md:p-16 dark:border-corner-stroke-dark dark:bg-slate-dark/20"
        style={{ minHeight: "clamp(600px, 80vh, 862px)" }}
      >
        {/* Left Content: Text */}
        <div className="z-10 flex h-full w-full flex-1 flex-col justify-center space-y-6 text-center md:space-y-8 md:text-left">
          <div>
            <h1 className="font-atyp text-[32px] leading-[1.1] tracking-wide text-brand-blue md:text-[48px]">
              TRUST AND IDENTITY <br />
              <span className="mt-2 block text-black dark:text-white">ARE</span>
            </h1>

            <div className="mt-4 min-h-[60px] md:min-h-[80px]">
              <p className="font-garamond text-[28px] leading-tight text-black/90 italic sm:text-4xl md:text-5xl lg:text-6xl dark:text-white/90">
                {displayedText}
                <span className="animate-pulse font-normal">|</span>
              </p>
            </div>
          </div>

          <p className="mx-auto max-w-lg font-sans text-base leading-relaxed text-gray-600 md:mx-0 md:text-lg dark:text-gray-200">
            The first portable, recover-able and self-sovereign identity.
            <br className="hidden md:block" />
            Carry your reputation across any wallet, anywhere
          </p>
        </div>

        {/* Right Content: Image */}
        <div className="relative hidden h-full w-full flex-1 items-center justify-center md:flex">
          <div className="relative flex h-full w-full items-center justify-center">
            <Image
              src="/assets/IsometricID.png"
              alt="Identity Card"
              width={800}
              height={600}
              className="object-contain dark:drop-shadow-md/40 dark:drop-shadow-white"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
}
