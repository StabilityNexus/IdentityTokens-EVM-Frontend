"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useScrollHiddenNav } from "@/hooks/useScrollHiddenNav";
import ToggleButton from "@/components/ui/ToggleButton";

export default function Navbar() {
  const isVisible = useScrollHiddenNav();

  return (
    <motion.div
      className="fixed top-0 right-0 left-0 z-50 w-full bg-landing-bg dark:bg-landing-bg-dark"
      initial={{ y: 0 }}
      animate={{ y: isVisible ? 0 : -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex h-16 w-full max-w-[1512px] items-center justify-between px-4 md:h-[80px] md:px-[56px]">
        <Link href="/" className="flex items-center gap-2 md:gap-[17px]">
          <div className="relative h-8 w-8 md:h-10 md:w-10">
            <Image
              src="/assets/logo.svg"
              alt="DIT Logo"
              fill
              className="object-contain dark:hidden"
            />
            <Image
              src="/assets/dark-logo.svg"
              alt="DIT Logo Dark"
              fill
              className="hidden object-contain dark:block"
            />
          </div>
          <span className="pt-1 font-atyp text-2xl leading-none text-black md:pt-2 md:text-[40px] dark:text-white">
            dit
          </span>
        </Link>
        <div className="flex items-center gap-3 md:gap-4">
          <ToggleButton />
          <ConnectButton />
        </div>
      </div>
    </motion.div>
  );
}
