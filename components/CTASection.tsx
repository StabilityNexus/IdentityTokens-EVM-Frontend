"use client";

import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";

const CTASection = () => {
  return (
    <section className="flex w-full justify-center bg-dark-bg px-4 py-10 md:py-20 dark:bg-black">
      {/* Gradient Box */}
      <div className="gradient-cta relative flex h-auto min-h-[300px] w-full max-w-[1264px] flex-col items-center overflow-hidden rounded-[30px] text-center shadow-2xl md:h-[510px] md:rounded-[57px] dark:shadow-none">
        {/* Headline */}
        <h2 className="mx-auto mt-8 max-w-[90%] px-4 font-utsaha text-2xl tracking-tight text-black md:mt-[72px] md:max-w-[768px] md:px-0 md:text-6xl">
          By Stability Nexus, For Everyone
        </h2>

        <p className="mt-5 px-4 font-utsaha text-lg text-black md:mt-[24px] md:text-2xl">
          Mint your Decentralized ID today
        </p>

        {/* --- Footer Area (Logos) --- */}
        <div className="mt-auto flex w-full flex-row items-center justify-between px-6 pb-8 md:px-20 md:pb-8">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="relative h-6 w-6 md:h-12 md:w-12">
              {/* Logo Icon — always use the black logo in CTA (light gradient bg in light, black bg in dark) */}
              <Image
                src="/assets/logo.svg"
                alt="DIT Logo"
                fill
                className="h-6 w-6 object-contain md:h-12 md:w-12"
              />
            </span>
            {/* Logo Text with Custom Font */}
            <span className="font-atyp text-xl tracking-tighter text-dark-bg md:text-4xl dark:text-dark-bg">
              dit
            </span>
          </div>

          {/* Social Icons mapped from constants */}
          <div className="flex items-center gap-3 md:gap-4">
            <Link
              href={SOCIAL_LINKS.website}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-transform hover:scale-110"
            >
              <Image
                src="/stability.svg"
                alt="Stability Nexus"
                width={40}
                height={40}
                className="h-6 w-6 object-contain md:h-10 md:w-10"
              />
            </Link>

            <Link
              href={SOCIAL_LINKS.github}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-transform hover:scale-110"
            >
              <Image
                src="/socials/GitHub.svg"
                alt="GitHub"
                width={40}
                height={40}
                className="h-6 w-6 object-contain md:h-10 md:w-10"
              />
            </Link>

            <Link
              href={SOCIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-transform hover:scale-110"
            >
              <Image
                src="/socials/Discord.svg"
                alt="Discord"
                width={40}
                height={40}
                className="h-6 w-6 object-contain md:h-10 md:w-10"
              />
            </Link>

            <Link
              href={SOCIAL_LINKS.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="transform transition-transform hover:scale-110"
            >
              <Image
                src="/socials/LinkedIn.svg"
                alt="LinkedIn"
                width={40}
                height={40}
                className="h-6 w-6 object-contain md:h-10 md:w-10"
              />
            </Link>
          </div>
        </div>

        {/* Privacy Policy & Support Us */}
        <div className="mb-2 flex flex-wrap items-center justify-center gap-3 md:mb-10 md:gap-4">
          <Link
            href="/privacy-policy"
            className="font-utsaha text-xs text-black/60 underline decoration-black/30 underline-offset-2 transition-colors hover:text-black hover:decoration-black md:text-sm"
          >
            Privacy Policy
          </Link>

          <span className="text-xs text-black/30 md:text-sm">•</span>

          <span className="font-utsaha text-xs text-black/60 md:text-sm">
            Support Us
          </span>

          <div className="flex items-center gap-2 md:gap-3">
            <Link
              href="https://docs.stability.nexus/about-us/fund-us/donate"
              target="_blank"
              rel="noopener noreferrer"
              className="transform opacity-50 transition-all hover:scale-110 hover:opacity-100"
              title="Donate via Stability Nexus"
            >
              <Image
                src="/stability.svg"
                alt="Donate via Stability Nexus"
                width={24}
                height={24}
                className="h-4 w-4 object-contain md:h-6 md:w-6"
              />
            </Link>

            <Link
              href="https://www.patreon.com/cw/AOSSIE"
              target="_blank"
              rel="noopener noreferrer"
              className="transform opacity-50 transition-all hover:scale-110 hover:opacity-100"
              title="Patreon"
            >
              <Image
                src="/socials/Patreon.svg"
                alt="Patreon"
                width={24}
                height={24}
                className="h-4 w-4 object-contain md:h-6 md:w-6"
              />
            </Link>

            <Link
              href="https://opencollective.com/aossie"
              target="_blank"
              rel="noopener noreferrer"
              className="transform opacity-50 transition-all hover:scale-110 hover:opacity-100"
              title="Open Collective"
            >
              <Image
                src="/socials/opencollective-icon.svg"
                alt="Open Collective"
                width={24}
                height={24}
                className="h-4 w-4 object-contain md:h-6 md:w-6"
              />
            </Link>

            <Link
              href="https://buymeacoffee.com/aossie"
              target="_blank"
              rel="noopener noreferrer"
              className="transform opacity-50 transition-all hover:scale-110 hover:opacity-100"
              title="Buy Me a Coffee"
            >
              <Image
                src="/socials/buymeacoffee.svg"
                alt="Buy Me a Coffee"
                width={24}
                height={24}
                className="h-4 w-4 object-contain md:h-6 md:w-6"
              />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
