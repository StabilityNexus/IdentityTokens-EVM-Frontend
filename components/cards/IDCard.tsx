"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "framer-motion";
import Badge from "@/components/Badge";
import { CLAIM_CHAIN, USERNAME_PLACEHOLDER, usernameSize } from "@/lib/claim";
import { WAVE_LINES, WAVE_VIEWBOX, wavePath } from "@/lib/cardArt";
import { truncateAddress } from "@/lib/helpers";
import { getRankFromAttesters } from "@/lib/rank";
import { IDCardProps } from "@/lib/types";
import { cn } from "@/lib/utils";

// Gentler than Aceternity's comet card (17.5° tilt, 20px shift).
const TILT_DEG = 7;
const SHIFT_PX = 6;
const HOVER_SCALE = 1.02;

/** Seconds for one full turn while a reservation confirms. */
const SPIN_SECONDS = 10;
const SPIN_SPEED = 360 / SPIN_SECONDS;

/** Longest the card takes to come round to the front once it stops. */
const SETTLE_SECONDS = 3;

const TILT_SPRING = { stiffness: 160, damping: 20, mass: 0.6 };

/** A short side-to-side shake, in px, for a name that is already taken. */
const SHAKE_KEYFRAMES = [0, -10, 9, -7, 5, -3, 0];

const WAVE_PATHS = WAVE_LINES.map((line) => ({ line, d: wavePath(line) }));

const SMALL_CAPS =
  "font-utsaha text-[1.9cqw] uppercase leading-none tracking-[0.2em] text-white/80";

const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

/** The dit ID card: animated on /claim, `still` with `attesters` on the dashboard. */
export function IDCard({
  username,
  walletAddress,
  dateLabel,
  attesters,
  still = false,
  spinning = false,
  onSpinSettled,
  shakeSignal,
  className,
}: IDCardProps) {
  const reduceMotion = useReducedMotion();

  // Pointer position across the card, -0.5 … 0.5 on each axis.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const hover = useMotionValue(0);
  const spin = useMotionValue(0);
  const shakeX = useMotionValue(0);

  const springX = useSpring(pointerX, TILT_SPRING);
  const springY = useSpring(pointerY, TILT_SPRING);
  const springHover = useSpring(hover, { stiffness: 220, damping: 26 });

  // The hovered side comes toward the viewer, as in the comet card.
  const rotateX = useTransform(springY, [-0.5, 0.5], [-TILT_DEG, TILT_DEG]);
  const rotateY = useTransform(springX, [-0.5, 0.5], [TILT_DEG, -TILT_DEG]);
  const shiftX = useTransform(springX, [-0.5, 0.5], [-SHIFT_PX, SHIFT_PX]);
  const shiftY = useTransform(springY, [-0.5, 0.5], [-SHIFT_PX, SHIFT_PX]);
  const scale = useTransform(springHover, [0, 1], [1, HOVER_SCALE]);

  // Safari's backface culling is unreliable, so the far face is hidden outright.
  const frontVisibility = useTransform(spin, (angle) =>
    Math.cos(toRadians(angle)) >= 0 ? "visible" : "hidden"
  );
  const backVisibility = useTransform(spin, (angle) =>
    Math.cos(toRadians(angle)) < 0 ? "visible" : "hidden"
  );

  const settledRef = useRef(onSpinSettled);
  useEffect(() => {
    settledRef.current = onSpinSettled;
  }, [onSpinSettled]);

  const hasSpun = useRef(false);

  useEffect(() => {
    if (spinning) {
      hasSpun.current = true;
      pointerX.set(0);
      pointerY.set(0);
      hover.set(0);
      if (reduceMotion) return;

      const from = spin.get();
      const turn = animate(spin, [from, from - 360], {
        duration: SPIN_SECONDS,
        ease: "linear",
        repeat: Infinity,
      });
      return () => turn.stop();
    }

    if (!hasSpun.current) return;
    hasSpun.current = false;

    // Carry on to the next front-facing angle, easing out from spin speed.
    const current = spin.get();
    const target = Math.floor(current / 360) * 360;
    const remaining = current - target;

    if (remaining < 0.5) {
      spin.set(target);
      settledRef.current?.();
      return;
    }

    const duration = Math.min(
      SETTLE_SECONDS,
      Math.max(0.6, (remaining / 360) * SETTLE_SECONDS)
    );
    const startSlope = Math.min(1 / 0.3, (SPIN_SPEED * duration) / remaining);
    const settle = animate(spin, target, {
      duration,
      ease: [0.3, 0.3 * startSlope, 0.4, 1],
      onComplete: () => settledRef.current?.(),
    });
    return () => settle.stop();
  }, [spinning, reduceMotion, spin, pointerX, pointerY, hover]);

  // Every new signal is one more shake, so retyping a taken name shakes again.
  useEffect(() => {
    if (!shakeSignal || reduceMotion) return;
    const shake = animate(shakeX, SHAKE_KEYFRAMES, {
      duration: 0.45,
      ease: "easeInOut",
    });
    return () => shake.stop();
  }, [shakeSignal, reduceMotion, shakeX]);

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    // Touch drags scroll the page; tilting under a finger would fight that.
    if (still || spinning || event.pointerType === "touch") return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set((event.clientX - rect.left) / rect.width - 0.5);
    pointerY.set((event.clientY - rect.top) / rect.height - 0.5);
    hover.set(1);
  };

  const handlePointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
    hover.set(0);
  };

  const handle = username || USERNAME_PLACEHOLDER;

  return (
    <div
      role="img"
      aria-label={`dit ID card for @${handle}`}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      className={cn(
        "@container relative w-full max-w-[520px] select-none perspective-[1600px]",
        className
      )}
    >
      <motion.div
        aria-hidden="true"
        style={{ x: shakeX }}
        animate={still || reduceMotion ? undefined : { y: [0, -6, 0] }}
        transition={{ duration: 6, ease: "easeInOut", repeat: Infinity }}
        className="transform-3d"
      >
        <motion.div
          style={{
            rotateX,
            rotateY,
            x: shiftX,
            y: shiftY,
            scale,
          }}
          className="transform-3d"
        >
          <motion.div
            style={{ rotateY: spin }}
            className="relative aspect-[1.586/1] w-full transform-3d"
          >
            {/* Front */}
            <motion.div
              style={{ visibility: frontVisibility }}
              className="absolute inset-0 overflow-hidden rounded-[4.5cqw] backface-hidden"
            >
              <CardSurface still={still} />

              <div className="absolute inset-0 flex items-center justify-center px-[6.5cqw] text-white">
                <p
                  className="max-w-full truncate font-utsaha leading-[1.2] font-bold"
                  style={{ fontSize: `${usernameSize(handle.length + 1)}cqw` }}
                >
                  <span className="text-white/70">@</span>
                  {username ? (
                    username
                  ) : (
                    <span className="text-white/60">
                      {USERNAME_PLACEHOLDER}
                    </span>
                  )}
                </p>
              </div>

              <div className="relative flex h-full flex-col justify-between p-[6.5cqw] text-white">
                <div
                  className={cn(
                    "flex justify-between gap-[4cqw]",
                    attesters !== undefined ? "items-start" : "items-center"
                  )}
                >
                  <div className="flex shrink-0 items-center gap-[1.3cqw]">
                    <Image
                      src="/assets/dark-logo.svg"
                      alt=""
                      width={44}
                      height={46}
                      className="h-[5.6cqw] w-auto"
                    />
                    <span className="font-atyp text-[5.2cqw] leading-none">
                      dit
                    </span>
                  </div>
                  {attesters !== undefined ? (
                    <div className="flex flex-col items-center">
                      <Badge
                        rank={getRankFromAttesters(attesters)}
                        size="7.5cqw"
                        className="drop-shadow-[0_3px_8px_rgb(0_0_0_/_0.25)]"
                      />
                      <p className="mt-[1.2cqw] font-utsaha text-[3.2cqw] leading-none font-bold">
                        {attesters}
                      </p>
                      <p className={cn(SMALL_CAPS, "mt-[0.8cqw]")}>
                        {attesters === 1 ? "Attester" : "Attesters"}
                      </p>
                    </div>
                  ) : (
                    <p className={SMALL_CAPS}>{dateLabel || "\u00a0"}</p>
                  )}
                </div>

                <div className="flex items-end justify-between gap-[4cqw]">
                  <p className="truncate font-utsaha text-[2.4cqw] leading-none text-white/80">
                    {walletAddress
                      ? truncateAddress(walletAddress, 6, 4)
                      : "0x0000…0000"}
                  </p>
                  <p className={cn(SMALL_CAPS, "shrink-0")}>
                    {CLAIM_CHAIN.name}
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Back */}
            <motion.div
              style={{ visibility: backVisibility }}
              className="absolute inset-0 rotate-y-180 overflow-hidden rounded-[4.5cqw] backface-hidden"
            >
              <CardSurface still={still} />

              <div className="relative flex h-full items-center justify-center">
                <Image
                  src="/assets/dark-logo.svg"
                  alt=""
                  width={44}
                  height={46}
                  className="h-[16cqw] w-auto opacity-90"
                />
              </div>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  );
}

/** The lacquered blue surface shared by both faces. */
function CardSurface({ still }: { still: boolean }) {
  // A still card keeps the same surface, just frozen where it starts.
  const motionClass = (animation: string) =>
    still
      ? ""
      : `${animation} will-change-transform motion-reduce:animate-none`;

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <div className="claim-card-base absolute inset-0" />

      {/* Drifting light and shade; transform-only so it never repaints. */}
      <div
        className={cn(
          "claim-card-blob-light absolute -top-1/3 -left-1/4 h-[120%] w-[80%] opacity-70",
          motionClass("animate-claim-drift")
        )}
      />
      <div
        className={cn(
          "claim-card-blob-deep absolute -right-1/4 -bottom-1/2 h-[130%] w-[85%] opacity-80",
          motionClass("animate-claim-drift-slow")
        )}
      />
      <div
        className={cn(
          "claim-card-blob-cyan absolute top-[8%] right-[6%] h-[70%] w-[45%] opacity-20",
          motionClass("animate-claim-drift-slow")
        )}
      />

      {/* Silk waves, echoing the lines of the dit mark. */}
      <div className="absolute -inset-[20%] -rotate-[14deg]">
        <div
          className={cn(
            "absolute inset-y-0 left-0 w-[200%]",
            motionClass("animate-claim-waves")
          )}
        >
          <svg
            viewBox={`0 0 ${WAVE_VIEWBOX.width} ${WAVE_VIEWBOX.height}`}
            preserveAspectRatio="none"
            className="h-full w-full"
          >
            {WAVE_PATHS.map(({ line, d }) => (
              <path
                key={line.y}
                d={d}
                fill="none"
                stroke="white"
                strokeOpacity={line.opacity}
                strokeWidth={line.width}
              />
            ))}
          </svg>
        </div>
      </div>

      <div className="claim-card-gloss absolute inset-0" />

      {/* Glass edge, as on the dashboard IDCard. */}
      <div className="absolute inset-0 rounded-[inherit] ring-1 ring-white/45 ring-inset" />
    </div>
  );
}

export default IDCard;
