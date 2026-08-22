"use client";

import Image from "next/image";
import Link from "next/link";
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
        className="relative mx-4 mt-4 flex w-full max-w-[1400px] flex-col items-center justify-center gap-6 overflow-hidden rounded-[28px] border border-corner-stroke/80 bg-slate-white/20 p-6 md:mx-[56px] md:mt-[19px] md:w-[calc(100%-112px)] md:gap-8 md:p-12 lg:p-16 dark:border-corner-stroke-dark dark:bg-slate-dark/20"
        style={{ minHeight: "clamp(600px, 80vh, 862px)" }}
      >
        {/* Hero Top Grid: Left Text & Right Image */}
        <div className="flex w-full flex-col items-center gap-8 md:flex-row md:gap-12">
          {/* Left Content: Text */}
          <div className="z-10 flex w-full flex-1 flex-col justify-center space-y-6 text-center md:space-y-8 md:text-left">
            <div>
              <h1 className="font-atyp text-[32px] leading-[1.1] tracking-wide text-brand-blue md:text-[48px]">
                TRUST AND IDENTITY <br />
                <span className="mt-2 block text-black dark:text-white">
                  ARE
                </span>
              </h1>

              <div className="mt-4 min-h-[60px] md:min-h-[80px]">
                <p className="font-garamond text-[28px] leading-tight text-black/90 italic sm:text-4xl md:text-5xl lg:text-6xl dark:text-white/90">
                  {displayedText}
                  <span className="animate-pulse font-normal">|</span>
                </p>
              </div>
            </div>

            <p className="mx-auto max-w-lg font-sans text-base leading-relaxed text-gray-600 md:mx-0 md:text-lg dark:text-gray-200">
              The first portable, recoverable and self-sovereign identity.
              <br className="hidden md:block" />
              Carry your reputation across any wallet, anywhere
            </p>
          </div>

          {/* Right Content: Image (Hidden on mobile) */}
          <div className="relative hidden w-full flex-1 items-center justify-center md:flex">
            <div className="relative flex h-[300px] w-full max-w-[320px] items-center justify-center sm:max-w-[480px] md:h-full md:max-w-none">
              <Image
                src="/assets/IsometricID.png"
                alt="Identity Card"
                width={800}
                height={600}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="object-contain dark:drop-shadow-md/40 dark:drop-shadow-white"
              />
            </div>
          </div>
        </div>

        {/* Centered CTA Button below IDCard and Paragraph */}
        <div className="z-10 mt-4 flex w-full justify-center md:mt-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-xl bg-brand-green px-6 py-3 font-utsaha text-lg text-dashboard-bg shadow-md transition-transform duration-200 ease-out hover:scale-[1.02] hover:bg-brand-green/90 active:scale-[0.98] md:px-8 md:py-3.5 md:text-xl"
          >
            Build Your Identity
          </Link>
        </div>
      </div>
    </section>
  );
}
