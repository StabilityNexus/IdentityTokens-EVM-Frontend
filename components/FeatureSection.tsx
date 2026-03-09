"use client";
import React, { useRef } from "react";
import FeatureCard from "@/components/cards/FeatureCard";
import { FEATURES_DATA } from "@/lib/constants";

export const FeatureSection: React.FC = () => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const getScrollAmount = () => {
    if (typeof window === "undefined") return 466 + 42;
    const isMobile = window.innerWidth < 768;
    return isMobile ? window.innerWidth * 0.85 + 16 : 466 + 42;
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const amount = getScrollAmount();
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -amount : amount,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="w-full bg-landing-bg py-20 dark:bg-landing-bg-dark">
      <div className="relative mx-auto max-w-[1440px] px-4">
        {/* --- Header Section --- */}
        <div className="relative mb-16 flex flex-col items-center justify-center">
          <div className="text-center">
            <h2 className="mb-2 font-utsaha text-3xl tracking-wide text-landhead-text md:text-5xl dark:text-landhead-text-dark">
              The Architecture of
            </h2>
            <h1 className="font-utsaha text-4xl tracking-tight text-landhead-text md:text-6xl dark:text-landhead-text-dark">
              Trust
            </h1>
          </div>

          {/* Navigation Arrows */}
          <div className="absolute right-0 bottom-2 hidden gap-4 md:flex">
            <button
              onClick={() => scroll("left")}
              aria-label="Scroll left"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue transition-colors hover:bg-brand-blue-hover"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:-translate-x-0.5"
              >
                <path
                  d="M15 19l-7-7 7-7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
            <button
              onClick={() => scroll("right")}
              aria-label="Scroll Right"
              className="group flex h-12 w-12 items-center justify-center rounded-full bg-brand-blue transition-colors hover:bg-brand-blue-hover"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                className="transition-transform group-hover:translate-x-0.5"
              >
                <path
                  d="M9 5l7 7-7 7"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* --- Carousel Section --- */}
        <div
          ref={scrollContainerRef}
          className="scrollbar-hide flex snap-x snap-mandatory items-center overflow-x-auto pb-10"
        >
          <div className="flex gap-4 md:gap-[42px]">
            {FEATURES_DATA.map((item, index) => (
              <div key={index} className="shrink-0 snap-center">
                <FeatureCard
                  bgImage={item.image}
                  title={item.title}
                  textColor={index % 2 === 0 ? "text-white" : "text-black"}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </section>
  );
};
