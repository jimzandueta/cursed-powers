"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

const RUB_TARGET = 18;
const STROKE_DISTANCE_PX = 28;
const RECENTER_DELAY_MS = 240;
const COMPLETION_HOLD_MS = 550;
const TEXT_FADE_DELAY_MS = 180;
const COMPLETION_DELAY_MS = 1_500;

const WISP_PARTICLES = [
  { id: 1, left: "22%", top: "56%", size: 70, delay: 0.1, duration: 4.5 },
  { id: 2, left: "50%", top: "48%", size: 90, delay: 1.2, duration: 5.2 },
  { id: 3, left: "72%", top: "58%", size: 76, delay: 0.6, duration: 4.8 },
];

const BURST_PARTICLES = [
  { id: 1, left: "28%", top: "42%", x: -30, y: -34, duration: 0.5 },
  { id: 2, left: "38%", top: "30%", x: -12, y: -42, duration: 0.65 },
  { id: 3, left: "52%", top: "26%", x: 0, y: -48, duration: 0.55 },
  { id: 4, left: "66%", top: "32%", x: 18, y: -40, duration: 0.7 },
  { id: 5, left: "74%", top: "44%", x: 34, y: -28, duration: 0.52 },
];

const RITUAL_COPY = [
  {
    threshold: 0,
    title: "Wake the old brass",
    body:
      "This lamp has slept beneath dunes, dynasties, and bad decisions. Rub until the metal remembers your name.",
  },
  {
    threshold: 0.28,
    title: "The seal starts to slip",
    body:
      "A whisper coils inside the chamber: Gold to ember, smoke to flame, stir the curse and speak no tame.",
  },
  {
    threshold: 0.58,
    title: "The genie is listening",
    body:
      "Every pass draws older magic to the surface. The bargain likes persistence more than politeness.",
  },
  {
    threshold: 0.86,
    title: "One last summoning stroke",
    body:
      "The lamp is hot, the smoke is awake, and something ancient is ready to misunderstand you on purpose.",
  },
];

interface LampRubbingProps {
  progress: number;
  onProgress: (progress: number) => void;
  onComplete: () => void;
}

export function LampRubbing({
  progress,
  onProgress,
  onComplete,
}: LampRubbingProps) {
  const rubCount = useRef(0);
  const strokeAnchorX = useRef(0);
  const strokeDirection = useRef<-1 | 0 | 1>(0);
  const isRubbing = useRef(false);
  const isPointerDown = useRef(false);
  const recenterTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const burstTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const completionTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const finaleTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasCompleted = useRef(false);
  const [strokePulse, setStrokePulse] = useState(0);
  const [hasBeenTouched, setHasBeenTouched] = useState(false);
  const [isCentering, setIsCentering] = useState(false);
  const [isRitualActive, setIsRitualActive] = useState(false);
  const [isCompletionBurst, setIsCompletionBurst] = useState(false);
  const [isLampFinale, setIsLampFinale] = useState(false);
  const ritualCopy =
    [...RITUAL_COPY].reverse().find((entry) => progress >= entry.threshold) ??
    RITUAL_COPY[0];
  const rubsRemaining = Math.max(0, Math.ceil((1 - progress) * RUB_TARGET));
  const chargeProgress = Math.min(progress, 0.9) / 0.9;
  const glowOpacity = 0.22 + chargeProgress * 0.58;
  const glowScale = 0.92 + chargeProgress * 0.34;
  const smokeOpacity = chargeProgress * 0.72;
  const smokeScale = 0.52 + chargeProgress * 1.08;
  const outerRingOpacity = 0.1 + chargeProgress * 0.26;
  const outerRingScale = 0.86 + chargeProgress * 0.14;
  const innerRingOpacity = progress > 0.22 ? 0.08 + chargeProgress * 0.2 : 0;
  const innerRingScale = 0.9 + chargeProgress * 0.1;
  const motionTier = progress >= 0.72 ? "high" : progress >= 0.36 ? "medium" : "low";
  const passiveFloatHeight = 8;
  const passiveDrift = 0.7;
  const passiveTilt = 0.45;
  const activeFloatHeight =
    motionTier === "high" ? 18 : motionTier === "medium" ? 14 : 10;
  const activeDrift =
    motionTier === "high" ? 4.4 : motionTier === "medium" ? 3 : 1.8;
  const activeTilt =
    motionTier === "high" ? 2.6 : motionTier === "medium" ? 1.8 : 1.1;
  const floatDuration = isRitualActive
    ? motionTier === "high"
      ? 1.7
      : motionTier === "medium"
        ? 1.95
        : 2.2
    : 3.4;
  const ritualStatus =
    progress >= 0.9
      ? "Summoning imminent"
      : progress >= 0.6
        ? "Smoke rising"
        : progress >= 0.3
          ? "Seal cracking"
          : progress > 0
            ? "Brass awakening"
            : "Rub the lamp";

  useEffect(() => {
    return () => {
      if (recenterTimeout.current) {
        clearTimeout(recenterTimeout.current);
      }
      if (burstTimeout.current) {
        clearTimeout(burstTimeout.current);
      }
      if (completionTimeout.current) {
        clearTimeout(completionTimeout.current);
      }
      if (finaleTimeout.current) {
        clearTimeout(finaleTimeout.current);
      }
    };
  }, []);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isRubbing.current || hasCompleted.current || isCentering) return;

      const delta = e.clientX - strokeAnchorX.current;
      if (Math.abs(delta) < STROKE_DISTANCE_PX) return;

      const nextDirection = delta > 0 ? 1 : -1;

      if (strokeDirection.current === 0) {
        strokeDirection.current = nextDirection;
        strokeAnchorX.current = e.clientX;
        return;
      }

      if (nextDirection !== strokeDirection.current) {
        rubCount.current += 1;
        strokeDirection.current = nextDirection;
        strokeAnchorX.current = e.clientX;
        setStrokePulse((value) => value + 1);

        const newProgress = Math.min(1, rubCount.current / RUB_TARGET);
        onProgress(newProgress);

        if (newProgress >= 1) {
          hasCompleted.current = true;
          isRubbing.current = false;
          setIsRitualActive(false);
          burstTimeout.current = setTimeout(() => {
            setIsCompletionBurst(true);
            finaleTimeout.current = setTimeout(() => {
              setIsLampFinale(true);
            }, TEXT_FADE_DELAY_MS);
          }, COMPLETION_HOLD_MS);
          completionTimeout.current = setTimeout(() => {
            onComplete();
          }, COMPLETION_DELAY_MS);
        }
      }
    },
    [onProgress, onComplete],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (hasCompleted.current) return;
    isPointerDown.current = true;

    if (!hasBeenTouched) {
      setHasBeenTouched(true);
      setIsCentering(true);
      setIsRitualActive(false);
      isRubbing.current = false;
      strokeAnchorX.current = e.clientX;
      strokeDirection.current = 0;

      recenterTimeout.current = setTimeout(() => {
        setIsCentering(false);
        if (isPointerDown.current && !hasCompleted.current) {
          isRubbing.current = true;
          setIsRitualActive(true);
          strokeAnchorX.current = e.clientX;
          strokeDirection.current = 0;
        }
      }, RECENTER_DELAY_MS);
      return;
    }

    isRubbing.current = true;
    setIsRitualActive(true);
    strokeAnchorX.current = e.clientX;
    strokeDirection.current = 0;
  }, [hasBeenTouched]);

  const handlePointerUp = useCallback(() => {
    isPointerDown.current = false;
    isRubbing.current = false;
    setIsRitualActive(false);
  }, []);

  return (
    <div className="flex flex-col items-center gap-10">
      <motion.div
        className="relative cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        animate={{
          y: isLampFinale
            ? 0
            : isCentering
              ? 0
            : isRitualActive
              ? [0, -activeFloatHeight, -activeFloatHeight * 0.4, -activeFloatHeight * 1.1, 0]
              : hasBeenTouched
                ? 0
                : [0, -passiveFloatHeight, 0, -passiveFloatHeight * 0.45, 0],
          x: isLampFinale
            ? 0
            : isCentering
              ? 0
            : isRitualActive
              ? [0, -activeDrift, activeDrift, -activeDrift * 0.55, activeDrift * 0.55, 0]
              : hasBeenTouched
                ? 0
                : [0, -passiveDrift, passiveDrift, 0],
          rotate: isLampFinale
            ? 0
            : isCentering
              ? 0
            : isRitualActive
              ? [0, -activeTilt, activeTilt, -activeTilt * 0.55, activeTilt * 0.55, 0]
              : hasBeenTouched
                ? 0
                : [0, -passiveTilt, passiveTilt, -passiveTilt * 0.4, passiveTilt * 0.4, 0],
        }}
        transition={
          isLampFinale
            ? { duration: 0.12 }
            : isCentering
              ? { duration: 0.22, ease: "easeOut" }
            : {
                duration: floatDuration,
                repeat: Infinity,
                ease: "easeInOut",
              }
        }
      >
        <motion.div
          className="relative"
          animate={{
            rotate: isLampFinale ? [0, 90, 220, 420, 720] : 0,
            scale: isLampFinale ? [1 + progress * 0.08, 0.68, 0.22] : 1 + progress * 0.08,
            y: isLampFinale ? [0, -26, -60] : 0,
            opacity: isLampFinale ? [1, 1, 0] : 1,
            filter: isLampFinale
              ? [
                  `drop-shadow(0 0 12px rgba(252,229,136,0.25))`,
                  `drop-shadow(0 0 36px rgba(252,229,136,0.85))`,
                  `drop-shadow(0 0 60px rgba(167,115,255,0.95))`,
                ]
              : "drop-shadow(0 0 0 rgba(0,0,0,0))",
          }}
          transition={{ duration: isLampFinale ? 0.72 : 0.3, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-300/10 pointer-events-none"
            style={{
              boxShadow: "0 0 50px rgba(232,185,35,0.12), inset 0 0 40px rgba(232,185,35,0.06)",
            }}
            animate={{
              rotate: 360,
              opacity: isCompletionBurst ? [0.5, 0] : outerRingOpacity,
              scale: isCompletionBurst ? [1.05, 1.55] : outerRingScale,
            }}
            transition={{
              rotate: { duration: 14, repeat: Infinity, ease: "linear" },
              opacity: { duration: isCompletionBurst ? 0.8 : 0.35 },
              scale: { duration: isCompletionBurst ? 0.8 : 0.35 },
            }}
          />

          <motion.div
            className="absolute left-1/2 top-1/2 h-[350px] w-[350px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-amber-200/10 pointer-events-none"
            animate={{
              rotate: -360,
              opacity: isCompletionBurst ? [0.45, 0] : innerRingOpacity,
              scale: isCompletionBurst ? [1.08, 1.72] : innerRingScale,
            }}
            transition={{
              rotate: { duration: 10, repeat: Infinity, ease: "linear" },
              opacity: { duration: isCompletionBurst ? 0.75 : 0.35 },
              scale: { duration: isCompletionBurst ? 0.75 : 0.35 },
            }}
          />

        {/* Intensifying warm glow beneath lamp */}
          <motion.div
            className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(232,185,35,0.4) 0%, transparent 70%)",
            }}
            animate={{
              opacity: isCompletionBurst ? [0.84, 1, 0] : glowOpacity,
              scale: isCompletionBurst ? [1.1, 1.45, 1.7] : glowScale,
            }}
            transition={{ duration: isCompletionBurst ? 0.8 : 0.3, ease: "easeOut" }}
          />

        {/* Purple smoke building above */}
          <motion.div
            className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none"
            style={{
              background:
                "radial-gradient(ellipse, rgba(160,100,255,0.3) 0%, transparent 70%)",
            }}
            animate={{
              opacity: isCompletionBurst ? [0.74, 0.95, 0] : smokeOpacity,
              scale: isCompletionBurst ? [1.2, 1.7, 2.2] : smokeScale,
            }}
            transition={{ duration: isCompletionBurst ? 0.85 : 0.3, ease: "easeOut" }}
          />

          {WISP_PARTICLES.map((wisp) => (
            <motion.div
              key={wisp.id}
              className="absolute rounded-full blur-3xl pointer-events-none"
              style={{
                left: wisp.left,
                top: wisp.top,
                width: wisp.size,
                height: wisp.size,
                background:
                  "radial-gradient(circle, rgba(167,115,255,0.18) 0%, rgba(232,185,35,0.1) 45%, transparent 75%)",
              }}
              animate={{
                y: [0, -24 - progress * 24, -52 - progress * 36],
                x: [0, wisp.id % 2 === 0 ? 18 : -16, 0],
                opacity: [0, progress * 0.45, 0],
                scale: [0.7, 1, 1.2],
              }}
              transition={{
                duration: wisp.duration,
                delay: wisp.delay,
                repeat: Infinity,
                ease: "easeOut",
              }}
            />
          ))}

        {/* Lamp image */}
          <Image
            src="/images/lamp.png"
            alt="Magic lamp"
            width={380}
            height={280}
            className="relative z-10"
            style={{
              filter: `drop-shadow(0 8px 24px rgba(232,185,35,${0.3 + progress * 0.5}))`,
            }}
            priority
            draggable={false}
          />

          {strokePulse > 0 && (
            <motion.div
              key={`pulse-${strokePulse}`}
              className="absolute left-1/2 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-gold-200/35 pointer-events-none z-20"
              initial={{ opacity: 0.65, scale: 0.78 }}
              animate={{ opacity: 0, scale: 1.18 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
            />
          )}

          {isCompletionBurst && (
            <motion.div
              className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full pointer-events-none z-30"
              style={{
                background:
                  "radial-gradient(circle, rgba(252,229,136,0.3) 0%, rgba(167,115,255,0.22) 35%, transparent 72%)",
              }}
              initial={{ opacity: 0.2, scale: 0.7 }}
              animate={{ opacity: [0.85, 0], scale: [0.85, 1.9] }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            />
          )}

          {strokePulse > 0 &&
            BURST_PARTICLES.map((particle) => (
              <motion.div
                key={`burst-${strokePulse}-${particle.id}`}
                className="absolute w-2 h-2 rounded-full bg-gold-200 pointer-events-none z-20"
                style={{ left: particle.left, top: particle.top }}
                initial={{ opacity: 0.95, scale: 0.7, x: 0, y: 0 }}
                animate={{ opacity: 0, scale: 0, x: particle.x, y: particle.y }}
                transition={{ duration: particle.duration, ease: "easeOut" }}
              />
            ))}

        {/* Sparkle particles during rubbing */}
          {progress > 0.15 &&
            Array.from({ length: Math.floor(progress * 12) }).map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full bg-gold-300 pointer-events-none z-20"
                initial={{
                  left: `${30 + Math.random() * 40}%`,
                  top: `${40 + Math.random() * 30}%`,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  top: `${Math.random() * 30}%`,
                  opacity: 0,
                  scale: 0,
                }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              />
            ))}
        </motion.div>
      </motion.div>

      {/* Progress indicator */}
      <motion.div
        className="w-full max-w-xl flex flex-col items-center gap-4 text-center px-4"
        animate={isCompletionBurst ? { opacity: 0, y: 10 } : { opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeOut" }}
      >
        <div className="w-full h-1 bg-mystic-700/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #8b6914, #e8b923, #fce588)",
            }}
            animate={{ width: `${progress * 100}%` }}
            transition={{ duration: 0.1 }}
          />
        </div>

        <motion.p
          className="font-display text-sm text-gold-400/50 tracking-[0.08em] md:tracking-[0.15em] italic"
          animate={{ opacity: isRitualActive ? [0.35, 0.8, 0.35] : 0.55 }}
          transition={{ duration: 1.2, repeat: isRitualActive ? Infinity : 0 }}
        >
          {ritualStatus}
        </motion.p>

        <div className="space-y-2 max-w-sm px-2 md:max-w-lg md:px-0">
          <p className="font-display text-base md:text-lg text-gold-300 tracking-[0.03em] md:tracking-[0.08em]">
            {ritualCopy.title}
          </p>
          <p className="text-sm md:text-base leading-6 md:leading-7 text-white/55">
            {ritualCopy.body}
          </p>
          <p className="text-xs uppercase tracking-[0.25em] text-white/30">
            {rubsRemaining > 0
              ? `${rubsRemaining} more passes to break the seal`
              : "The seal is broken"}
          </p>
        </div>
      </motion.div>
    </div>
  );
}
