"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { STEPS_DATA } from "@/lib/constants";

export default function HowItWorks() {
  const [activeStep, setActiveStep] = useState(1);
  const totalSteps = STEPS_DATA.length;

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStep((prev) => (prev === totalSteps ? 1 : prev + 1));
    }, 4000);
    return () => clearInterval(timer);
  }, [totalSteps]);

  // Find current step data safely
  const currentStepData =
    STEPS_DATA.find((s) => s.id === activeStep) || STEPS_DATA[0];

  return (
    <section className="mt-[2px] flex w-full flex-col items-center justify-center bg-landing-bg px-4 py-12 md:py-16 dark:bg-landing-bg-dark">
      {/* --- TITLE SECTION --- */}
      <div className="mb-[7px] flex flex-col items-center text-center">
        <div className="flex items-center gap-2 md:gap-4">
          <span className="font-utsaha text-[36px] leading-tight text-landhead-text md:text-[50px] lg:text-[64px] dark:text-landhead-text-dark">
            Your
          </span>
          <div className="relative mt-1 h-[30px] w-[30px] md:mt-2 md:h-[45px] md:w-[44px]">
            <Image
              src="/assets/Isologo.svg"
              alt="logo"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/assets/Isologo-dark.svg"
              alt="Logo Dark"
              fill
              className="hidden object-contain dark:block"
            />
          </div>
          <span className="font-utsaha text-[36px] leading-tight text-landhead-text md:text-[50px] lg:text-[64px] dark:text-landhead-text-dark">
            Identity
          </span>
        </div>
        <span className="font-utsaha text-[36px] leading-tight text-landhead-text md:text-[50px] lg:text-[64px] dark:text-landhead-text-dark">
          Simplified
        </span>
      </div>

      {/* --- MAIN CARD CONTAINER --- */}
      <div
        className="relative flex w-full max-w-[1000px] flex-col overflow-hidden rounded-[28px] bg-step-card shadow-2xl transition-all duration-300 md:flex-row md:rounded-[40px] dark:bg-step-card-dark"
        style={{ minHeight: "clamp(500px, 70vh, 600px)" }}
      >
        {/* --- STEPS SECTION --- */}
        <div className="relative z-10 flex w-full flex-col justify-center p-4 pt-8 md:w-auto md:flex-1 md:py-10 md:pl-[60px]">
          <div className="relative mx-auto flex w-full max-w-[350px] flex-row items-center justify-between md:mx-0 md:max-w-none md:flex-col md:items-stretch md:justify-start">
            {/* === DESKTOP LINES (Vertical) === */}
            <div className="absolute top-[30px] bottom-[30px] left-[29px] hidden w-[2px] bg-step-line md:block dark:bg-step-line-dark" />
            <motion.div
              className="absolute top-[30px] left-[29px] hidden w-[2px] origin-top bg-step-active md:block"
              animate={{
                height: `${totalSteps > 1 ? ((activeStep - 1) / (totalSteps - 1)) * 100 : 0}%`,
              }}
              style={{ maxHeight: "calc(100% - 60px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* === MOBILE LINES (Horizontal) === */}
            <div className="absolute top-[16px] right-[16px] left-[16px] h-[2px] bg-step-line md:hidden dark:bg-step-line-dark" />
            <motion.div
              className="absolute top-[16px] left-[16px] h-[2px] origin-left bg-step-active md:hidden"
              animate={{
                width: `${((activeStep - 1) / (totalSteps - 1)) * 100}%`,
              }}
              style={{ maxWidth: "calc(100% - 32px)" }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            />

            {/* === THE STEPS === */}
            {STEPS_DATA.map((step, index) => {
              const isActive = activeStep >= step.id;

              return (
                <div
                  key={step.id}
                  className={cn(
                    "group relative z-10 flex cursor-pointer",
                    "md:flex-row md:items-center",
                    "flex-col items-center",
                    index !== totalSteps - 1 ? "md:mb-[90px]" : "md:mb-0"
                  )}
                  onClick={() => setActiveStep(step.id)}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center rounded-full border-2 bg-step-card font-utsaha transition-all duration-300",
                      "h-8 w-8 text-xs md:h-[60px] md:w-[60px] md:text-lg md:text-xl",
                      isActive
                        ? "border-step-active bg-step-active text-black"
                        : "border-step-line bg-step-card text-white/50 dark:border-step-line-dark dark:bg-step-card-dark dark:text-step-line-dark"
                    )}
                  >
                    {step.id}
                  </div>

                  <h3
                    className={cn(
                      "font-utsaha transition-colors duration-300",
                      "md:mt-0 md:ml-[21px] md:text-[28px]",
                      "mt-2 text-center text-xs",
                      activeStep === step.id
                        ? "text-white dark:text-black"
                        : "text-white/40 dark:text-black/40"
                    )}
                  >
                    {step.title}
                  </h3>
                </div>
              );
            })}
          </div>
        </div>

        {/* --- IMAGE SECTION --- */}
        <div className="mt-1 flex w-full flex-1 items-center justify-center p-0 pb-4 md:my-[40px] md:mr-[40px] md:w-auto md:p-0 md:pb-0">
          <div className="relative h-[380px] w-full max-w-[250px] md:h-[520px] md:w-[450px] md:max-w-none">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.4 }}
                className="relative h-full w-full"
              >
                <Image
                  src={currentStepData.image}
                  alt={currentStepData.title}
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
