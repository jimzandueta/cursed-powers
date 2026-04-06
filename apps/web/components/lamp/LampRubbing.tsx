"use client";

import { useRef, useCallback } from "react";
import Image from "next/image";
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
    <div className="flex flex-col items-center gap-10">
      <motion.div
        className="relative cursor-grab active:cursor-grabbing select-none touch-none"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
        animate={{
          rotate: progress > 0 ? [0, -1.5, 1.5, -0.8, 0.8, 0] : 0,
          scale: 1 + progress * 0.08,
        }}
        transition={{ duration: 0.3 }}
      >
        {/* Intensifying warm glow beneath lamp */}
        <motion.div
          className="absolute -bottom-6 left-1/2 -translate-x-1/2 w-96 h-28 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(232,185,35,0.4) 0%, transparent 70%)",
          }}
          animate={{ opacity: 0.2 + progress * 0.7 }}
        />

        {/* Purple smoke building above */}
        <motion.div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(ellipse, rgba(160,100,255,0.3) 0%, transparent 70%)",
          }}
          animate={{ opacity: progress * 0.8, scale: 0.5 + progress * 1.2 }}
        />

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

      {/* Progress indicator */}
      <div className="w-56 flex flex-col items-center gap-3">
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

        <p className="font-display text-sm text-gold-400/50 tracking-[0.15em] italic">
          Keep rubbing...
        </p>
      </div>
    </div>
  );
}
