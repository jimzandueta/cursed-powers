"use client";

import { useEffect, useRef, useCallback } from "react";
import { motion } from "framer-motion";

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
  const lastX = useRef(0);
  const isRubbing = useRef(false);

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isRubbing.current) return;
      const dx = Math.abs(e.clientX - lastX.current);
      if (dx > 10) {
        rubCount.current += 1;
        lastX.current = e.clientX;
        const newProgress = Math.min(1, rubCount.current / 12);
        onProgress(newProgress);
        if (newProgress >= 1) {
          isRubbing.current = false;
          onComplete();
        }
      }
    },
    [onProgress, onComplete],
  );

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    isRubbing.current = true;
    lastX.current = e.clientX;
  }, []);

  const handlePointerUp = useCallback(() => {
    isRubbing.current = false;
  }, []);

  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        className="relative cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        animate={{
          rotate: progress > 0 ? [0, -2, 2, -1, 1, 0] : 0,
          scale: 1 + progress * 0.1,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Intensifying glow */}
        <motion.div
          className="absolute inset-0 -m-12 rounded-full bg-gold-400 blur-3xl"
          animate={{ opacity: 0.1 + progress * 0.5 }}
        />

        {/* Smoke building up */}
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full bg-gradient-to-t from-transparent to-teal-400/30 blur-2xl"
          animate={{ opacity: progress * 0.8, scale: 0.5 + progress * 1 }}
        />

        {/* Lamp SVG (same as idle but shaking) */}
        <svg
          width="200"
          height="140"
          viewBox="0 0 200 140"
          className="relative z-10 drop-shadow-2xl"
        >
          <ellipse cx="100" cy="95" rx="60" ry="25" fill="url(#lampGoldRub)" />
          <ellipse
            cx="100"
            cy="90"
            rx="55"
            ry="22"
            fill="url(#lampGoldLightRub)"
          />
          <path
            d="M 75 90 Q 70 60 85 45 Q 95 38 100 35"
            stroke="url(#lampGoldRub)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 100 35 Q 110 30 125 28"
            stroke="url(#lampGoldRub)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />
          <path
            d="M 130 75 Q 155 60 145 85"
            stroke="url(#lampGoldRub)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient
              id="lampGoldRub"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#f5c518" />
              <stop offset="50%" stopColor="#d4a017" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
            <linearGradient
              id="lampGoldLightRub"
              x1="0%"
              y1="0%"
              x2="0%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#fce588" />
              <stop offset="100%" stopColor="#d4a017" />
            </linearGradient>
          </defs>
        </svg>

        {/* Sparkle particles during rubbing */}
        {progress > 0.2 &&
          Array.from({ length: Math.floor(progress * 8) }).map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 rounded-full bg-gold-300"
              initial={{
                x: 80 + Math.random() * 40,
                y: 60 + Math.random() * 30,
                opacity: 1,
              }}
              animate={{
                x: 80 + Math.random() * 40 + (Math.random() - 0.5) * 60,
                y: Math.random() * 60,
                opacity: 0,
              }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          ))}
      </motion.div>

      {/* Progress indicator */}
      <div className="w-48 h-1.5 bg-mystic-700 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-gold-400 to-ember rounded-full"
          animate={{ width: `${progress * 100}%` }}
          transition={{ duration: 0.1 }}
        />
      </div>

      <p className="font-display text-sm text-gold-400/60 tracking-wider">
        Keep rubbing...
      </p>
    </div>
  );
}
