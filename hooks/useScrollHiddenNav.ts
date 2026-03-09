import { useState, useRef } from "react";
import { useScroll, useMotionValueEvent } from "framer-motion";

export function useScrollHiddenNav(threshold = 50) {
  const [isVisible, setIsVisible] = useState(true);
  const { scrollY } = useScroll();
  const lastScrollY = useRef(0);

  useMotionValueEvent(scrollY, "change", (latest) => {
    const currentScrollY = latest;
    if (currentScrollY > lastScrollY.current && currentScrollY > threshold) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }
    lastScrollY.current = currentScrollY;
  });

  return isVisible;
}
