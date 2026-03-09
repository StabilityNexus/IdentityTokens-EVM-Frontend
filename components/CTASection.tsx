"use client";

import Image from "next/image";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/lib/constants";

const CTASection = () => {
  return (
    <section className="flex w-full justify-center bg-dark-bg px-4 py-10 md:py-20 dark:bg-landing-bg">
      <div className="gradient-cta relative flex h-auto min-h-[300px] w-full max-w-[1264px] flex-col items-center overflow-hidden rounded-[30px] text-center shadow-2xl md:h-[510px] md:rounded-[57px]">
        {/* --- Background Noise --- */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
            backgroundRepeat: "repeat",
            mixBlendMode: "overlay",
          }}
        />

        <h2 className="mx-auto mt-8 max-w-[90%] px-4 font-utsaha text-2xl tracking-tight text-black md:mt-[72px] md:max-w-[768px] md:px-0 md:text-6xl">
          By Stability Nexus, For Everyone
        </h2>

        <p className="mt-5 px-4 font-utsaha text-lg text-black md:mt-[24px] md:text-2xl">
          Mint your Decentralized ID today
        </p>

        {/* --- Footer Area (Logos) --- */}
        <div className="mt-auto flex w-full flex-row items-center justify-between px-6 pb-8 md:px-20 md:pb-16">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="relative h-6 w-6 md:h-12 md:w-12">
              <Image
                src="/assets/logo.svg"
                alt="DIT Logo"
                fill
                className="h-6 w-6 object-contain md:h-12 md:w-12 dark:hidden"
              />
              <Image
                src="/assets/dark-logo.svg"
                alt="DIT Logo Dark"
                fill
                className="hidden h-6 w-6 object-contain md:h-12 md:w-12 dark:block"
              />
            </span>
            <span className="font-atyp text-xl tracking-tighter text-dark-bg md:text-4xl dark:text-white/85">
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
      </div>
    </section>
  );
};

// Small local sub-component for cleanliness
const SocialIcon = ({
  href,
  src,
  alt,
}: {
  href: string;
  src: string;
  alt: string;
}) => (
  <Link
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    className="transform transition-transform hover:scale-110"
  >
    <Image
      src={src}
      alt={alt}
      width={40}
      height={40}
      className="h-6 w-6 object-contain md:h-10 md:w-10"
    />
  </Link>
);

export default CTASection;
