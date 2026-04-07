"use client";

import { useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface GenieProps {
  onRevealed: () => void;
}

// Pre-generate sparkle positions so they don't re-randomize on re-render
function generateSparkles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${10 + Math.random() * 80}%`,
    top: `${15 + Math.random() * 70}%`,
    delay: Math.random() * 3,
    duration: 1.5 + Math.random() * 2,
    size: 2 + Math.random() * 4,
  }));
}

function generateSmokeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: `${25 + Math.random() * 50}%`,
    startTop: `${60 + Math.random() * 25}%`,
    delay: Math.random() * 2,
    duration: 3 + Math.random() * 3,
    size: 20 + Math.random() * 40,
    opacity: 0.15 + Math.random() * 0.25,
  }));
}

function generateBurstParticles(count: number) {
  const palettes = [
    {
      core: "rgba(255,252,244,1)",
      mid: "rgba(255,241,198,0.95)",
      outer: "rgba(255,228,148,0.55)",
      glow: "rgba(255,245,214,0.38)",
    },
    {
      core: "rgba(255,248,230,1)",
      mid: "rgba(255,232,170,0.92)",
      outer: "rgba(255,212,120,0.48)",
      glow: "rgba(255,223,156,0.34)",
    },
    {
      core: "rgba(248,244,255,1)",
      mid: "rgba(255,247,219,0.9)",
      outer: "rgba(255,235,186,0.42)",
      glow: "rgba(255,255,240,0.32)",
    },
    {
      core: "rgba(255,255,255,1)",
      mid: "rgba(255,244,208,0.94)",
      outer: "rgba(255,223,132,0.5)",
      glow: "rgba(255,250,225,0.36)",
    },
  ];

  return Array.from({ length: count }, (_, i) => ({
    id: i,
    angle: (Math.PI * 2 * i) / count,
    distance: 95 + Math.random() * 125,
    size: 4 + Math.random() * 10,
    stretch: 1 + Math.random() * 1.6,
    delay: Math.random() * 0.22,
    duration: 0.85 + Math.random() * 0.5,
    palette: palettes[i % palettes.length],
  }));
}

export function Genie({ onRevealed }: GenieProps) {
  const [showText, setShowText] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const message =
    "You have summoned me. What superpower do you desire, mortal?";
  const [displayedText, setDisplayedText] = useState("");

  const sparkles = useMemo(() => generateSparkles(14), []);
  const smokeParticles = useMemo(() => generateSmokeParticles(8), []);
  const burstParticles = useMemo(() => generateBurstParticles(30), []);

  useEffect(() => {
    const showTimer = setTimeout(() => setShowText(true), 1200);
    return () => clearTimeout(showTimer);
  }, []);

  useEffect(() => {
    if (!showText) return;

    let i = 0;
    const interval = setInterval(() => {
      i++;
      setDisplayedText(message.slice(0, i));
      if (i >= message.length) {
        clearInterval(interval);
        setTextComplete(true);
        setTimeout(onRevealed, 2500);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [showText, onRevealed]);

  return (
    <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-8">
      {/* Burst background glow */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.45] }}
        transition={{ duration: 1.7, times: [0, 0.28, 1] }}
      >
        <motion.div
          className="w-[500px] h-[500px] rounded-full blur-3xl"
          style={{
            background:
              "radial-gradient(circle, rgba(50,140,200,0.3) 0%, rgba(232,185,35,0.1) 40%, transparent 70%)",
          }}
          initial={{ scale: 0.45 }}
          animate={{ scale: [0.45, 1.2, 1] }}
          transition={{ duration: 1.4, ease: "easeOut" }}
        />
      </motion.div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {burstParticles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute rounded-full z-40"
            style={{
              width: particle.size * particle.stretch,
              height: particle.size,
              background:
                `radial-gradient(circle, ${particle.palette.core} 0%, ${particle.palette.mid} 42%, ${particle.palette.outer} 68%, transparent 100%)`,
              boxShadow: `0 0 ${particle.size * 3.5}px ${particle.palette.glow}`,
              rotate: `${(particle.angle * 180) / Math.PI}deg`,
            }}
            initial={{ opacity: 0, scale: 0.2, x: 0, y: 0 }}
            animate={{
              opacity: [0, 1, 0],
              scale: [0.2, 1.2, 0],
              x: [0, Math.cos(particle.angle) * particle.distance],
              y: [0, Math.sin(particle.angle) * particle.distance],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20 overflow-hidden">
        {smokeParticles.map((p) => (
          <motion.div
            key={`summon-${p.id}`}
            className="absolute rounded-full blur-2xl"
            style={{
              left: p.left,
              top: p.startTop,
              width: p.size * 1.4,
              height: p.size * 1.4,
              background: `radial-gradient(circle, rgba(185,230,255,${p.opacity + 0.08}) 0%, rgba(160,110,255,0.12) 55%, transparent 78%)`,
            }}
            initial={{ opacity: 0, scale: 0.45, y: 50 }}
            animate={{
              opacity: [0, p.opacity + 0.1, 0],
              scale: [0.45, 1.3, 1.55],
              y: [50, -10, -110],
              x: [0, p.id % 2 === 0 ? 24 : -24, 0],
            }}
            transition={{
              duration: 1.5,
              delay: p.delay * 0.35,
              ease: "easeOut",
            }}
          />
        ))}
      </div>

      {/* Genie container with all effects */}
      <motion.div
        className="relative"
        initial={{ scale: 0.08, opacity: 0, y: 120, rotate: -220 }}
        animate={{ scale: 1, opacity: 1, y: 0, rotate: 0 }}
        transition={{
          rotate: { duration: 1.05, ease: [0.18, 0.9, 0.2, 1] },
          scale: { type: "spring", stiffness: 180, damping: 16, duration: 1.05 },
          opacity: { duration: 0.45 },
          y: { type: "spring", stiffness: 150, damping: 14, duration: 1.05 },
        }}
      >
        {/* Cloud / mystic background behind genie */}
        <div className="absolute inset-0 -inset-x-16 -inset-y-8 pointer-events-none z-0">
          {/* Layered cloud shapes */}
          <motion.div
            className="absolute top-[10%] left-[5%] w-48 h-32 rounded-full blur-2xl"
            style={{ background: "rgba(100,160,220,0.12)" }}
            animate={{ x: [0, 15, 0], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-[5%] right-[8%] w-40 h-28 rounded-full blur-2xl"
            style={{ background: "rgba(120,140,200,0.1)" }}
            animate={{ x: [0, -12, 0], opacity: [0.25, 0.45, 0.25] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          />
          <motion.div
            className="absolute top-[25%] left-[15%] w-56 h-36 rounded-full blur-3xl"
            style={{ background: "rgba(80,150,200,0.08)" }}
            animate={{ y: [0, -8, 0], opacity: [0.2, 0.35, 0.2] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
          <motion.div
            className="absolute bottom-[20%] left-[20%] w-52 h-32 rounded-full blur-3xl"
            style={{ background: "rgba(60,120,180,0.1)" }}
            animate={{ x: [0, 10, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
        </div>

        {/* Animated smoke wisps in foreground */}
        <div className="absolute inset-0 -inset-x-8 pointer-events-none z-20 overflow-hidden">
          {smokeParticles.map((p) => (
            <motion.div
              key={p.id}
              className="absolute rounded-full blur-xl"
              style={{
                left: p.left,
                top: p.startTop,
                width: p.size,
                height: p.size,
                background: `radial-gradient(circle, rgba(180,220,255,${p.opacity}) 0%, transparent 70%)`,
              }}
              animate={{
                y: [0, -80, -160],
                x: [0, (p.id % 2 === 0 ? 20 : -20), 0],
                opacity: [0, p.opacity, 0],
                scale: [0.5, 1.3, 0.8],
              }}
              transition={{
                duration: p.duration,
                repeat: Infinity,
                delay: p.delay,
                ease: "easeOut",
              }}
            />
          ))}
        </div>

        {/* Glowing sparkle particles in foreground */}
        <div className="absolute inset-0 -inset-x-12 -inset-y-4 pointer-events-none z-30">
          {sparkles.map((sp) => (
            <motion.div
              key={sp.id}
              className="absolute rounded-full"
              style={{
                left: sp.left,
                top: sp.top,
                width: sp.size,
                height: sp.size,
                background: "radial-gradient(circle, rgba(255,230,130,0.9) 0%, rgba(255,200,50,0.4) 50%, transparent 100%)",
                boxShadow: `0 0 ${sp.size * 2}px rgba(255,220,100,0.4)`,
              }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0, 1.3, 0],
                y: [0, -10, 0],
              }}
              transition={{
                duration: sp.duration,
                repeat: Infinity,
                delay: sp.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Genie image */}
        <Image
          src="/images/genie.png"
          alt="Cursed Genie"
          width={320}
          height={520}
          className="relative z-10 drop-shadow-[0_0_30px_rgba(50,150,220,0.3)]"
          priority
          draggable={false}
        />
      </motion.div>

      {/* Speech bubble */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="w-[22rem] md:w-[32rem] h-[8.5rem] md:h-[9.5rem] mx-auto px-7 py-5 bg-mystic-800/80 border border-gold-400/20 rounded-2xl backdrop-blur-sm relative flex items-center justify-center overflow-hidden"
            style={{
              boxShadow:
                "0 0 30px rgba(232,185,35,0.08), inset 0 0 20px rgba(50,150,220,0.05)",
            }}
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="absolute top-2 left-3 w-4 h-4 border-t border-l border-gold-400/20 rounded-tl-sm" />
            <div className="absolute top-2 right-3 w-4 h-4 border-t border-r border-gold-400/20 rounded-tr-sm" />
            <div className="absolute bottom-2 left-3 w-4 h-4 border-b border-l border-gold-400/20 rounded-bl-sm" />
            <div className="absolute bottom-2 right-3 w-4 h-4 border-b border-r border-gold-400/20 rounded-br-sm" />

            <p className="font-display text-center text-gold-300 text-lg leading-relaxed italic tracking-wide">
              {displayedText}
              {!textComplete && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  className="ml-0.5"
                >
                  |
                </motion.span>
              )}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
