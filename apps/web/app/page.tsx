"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWishFlow } from "../hooks/useWishFlow";
import { LampRubbing } from "../components/lamp/LampRubbing";
import { Genie } from "../components/genie/Genie";
import { WishInput } from "../components/wish/WishInput";
import { WishLoading } from "../components/wish/WishLoading";
import { WishResult } from "../components/wish/WishResult";

const INPUT_GENIE_PARTICLES = [
  { id: 1, left: "12%", top: "18%", size: 10, delay: 0.2, duration: 5.5 },
  { id: 2, left: "24%", top: "68%", size: 6, delay: 1.1, duration: 4.8 },
  { id: 3, left: "38%", top: "26%", size: 8, delay: 0.6, duration: 6.2 },
  { id: 4, left: "52%", top: "74%", size: 12, delay: 1.8, duration: 5.1 },
  { id: 5, left: "64%", top: "20%", size: 7, delay: 0.4, duration: 4.4 },
  { id: 6, left: "79%", top: "58%", size: 9, delay: 2.1, duration: 5.8 },
  { id: 7, left: "88%", top: "30%", size: 5, delay: 1.4, duration: 4.9 },
  { id: 8, left: "71%", top: "84%", size: 11, delay: 0.9, duration: 6.4 },
];

const INPUT_GENIE_SMOKE = [
  { id: 1, left: "18%", top: "62%", size: 88, delay: 0.3, duration: 8.2 },
  { id: 2, left: "34%", top: "72%", size: 72, delay: 1.6, duration: 7.4 },
  { id: 3, left: "58%", top: "66%", size: 94, delay: 0.9, duration: 9.1 },
  { id: 4, left: "74%", top: "74%", size: 76, delay: 2.2, duration: 8.7 },
  { id: 5, left: "48%", top: "82%", size: 110, delay: 1.1, duration: 10.4 },
];

export default function Home() {
  const {
    state,

    updateRub,
    revealGenie,
    showInput,
    submitWish,
    retry,
  } = useWishFlow();

  const isLampScreen = state.screen === "rubbing";
  const isCursedReveal = state.hasSubmittedWish;
  const headerSubtitle = isCursedReveal
    ? "Every superpower has a catch™"
    : "Your wish is my command";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Title - hidden on lamp page, transitions between hopeful ↔ cursed */}
      <AnimatePresence>
        {!isLampScreen && (
          <motion.div
            key="header"
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="font-display text-4xl md:text-6xl font-bold text-gold-400 text-glow tracking-wide mb-3">
              <span className="relative inline-block">
                <span
                  className={`transition-all duration-300 ${
                    isCursedReveal
                      ? "text-gold-400/10 line-through decoration-2 decoration-gold-200/20 opacity-30"
                      : ""
                  }`}
                >
                  Golden
                </span>
                <AnimatePresence>
                  {isCursedReveal && (
                    <motion.span
                      className="font-cursed font-normal absolute inset-0 flex items-center justify-center text-red-700"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      Broken
                    </motion.span>
                  )}
                </AnimatePresence>
              </span>
              {" Powers"}
            </h1>
            {/* Ornamental divider under title */}
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-12 h-px bg-gradient-to-r from-transparent to-gold-400/30" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400/40" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400/60" />
              <div className="w-1.5 h-1.5 rounded-full bg-gold-400/40" />
              <div className="w-12 h-px bg-gradient-to-l from-transparent to-gold-400/30" />
            </div>
            <p className="text-white/30 text-sm md:text-base tracking-[0.2em] italic font-display">
              {headerSubtitle}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content area — consistent stage for all screens */}
      <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center">
        <AnimatePresence mode="wait">
          {/* RUBBING - Interactive lamp — shifted down since header is hidden */}
          {state.screen === "rubbing" && (
            <motion.div
              key="rubbing"
              className="w-full flex justify-center pt-24 md:pt-40 pb-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18, ease: "easeOut" }}
            >
              <LampRubbing
                progress={state.rubProgress}
                onProgress={updateRub}
                onComplete={revealGenie}
              />
            </motion.div>
          )}

          {/* GENIE REVEALED */}
          {state.screen === "genie-revealed" && (
            <motion.div
              key="genie"
              className="w-full flex justify-center py-8"
              initial={{ opacity: 0, scale: 0.86 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.15, y: 40 }}
              transition={{ duration: 0.75, ease: [0.16, 0.84, 0.24, 1] }}
            >
              <Genie onRevealed={showInput} />
            </motion.div>
          )}

          {/* INPUT */}
          {state.screen === "input" && (
            <motion.div
              key="input"
              className="w-full relative min-h-[50vh] flex items-center justify-center py-8"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Background effects layer covers the full viewport so the ghost genie
                  is visually centered on screen, matching where the real genie was */}
              <motion.div
                className="fixed inset-0 pointer-events-none -z-10"
                initial={{ opacity: 0, scale: 0.88 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <motion.div
                  className="absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full blur-3xl"
                  style={{
                    background:
                      "radial-gradient(circle, rgba(70,170,220,0.18) 0%, rgba(232,185,35,0.12) 38%, transparent 72%)",
                  }}
                  animate={{
                    opacity: [0.35, 0.55, 0.35],
                    scale: [0.96, 1.06, 0.96],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />

                <motion.img
                  src={
                    isCursedReveal
                      ? "/images/genie-cursed.png"
                      : "/images/genie.png"
                  }
                  alt=""
                  aria-hidden="true"
                  className="absolute left-1/2 top-1/2 w-[320px] max-w-none -translate-x-1/2 -translate-y-1/2 opacity-15 drop-shadow-[0_0_42px_rgba(80,180,230,0.22)]"
                  draggable={false}
                  initial={{ y: 36, opacity: 0 }}
                  animate={{
                    y: [0, -12, 0],
                    x: [0, 4, 0],
                    rotate: [0, -0.5, 0.5, 0],
                    opacity: 0.22,
                  }}
                  transition={{
                    opacity: { duration: 0.8 },
                    y: { duration: 6.4, repeat: Infinity, ease: "easeInOut" },
                    x: { duration: 8.8, repeat: Infinity, ease: "easeInOut" },
                    rotate: {
                      duration: 8.2,
                      repeat: Infinity,
                      ease: "easeInOut",
                    },
                  }}
                />

                {INPUT_GENIE_SMOKE.map((plume) => (
                  <motion.div
                    key={plume.id}
                    className="absolute rounded-full blur-3xl"
                    style={{
                      left: plume.left,
                      top: plume.top,
                      width: plume.size,
                      height: plume.size,
                      background:
                        "radial-gradient(circle, rgba(96,186,235,0.12) 0%, rgba(232,185,35,0.08) 38%, transparent 72%)",
                    }}
                    animate={{
                      y: [0, -30, -58],
                      x: [0, plume.id % 2 === 0 ? 18 : -14, 0],
                      opacity: [0, 0.34, 0],
                      scale: [0.72, 1.08, 1.28],
                    }}
                    transition={{
                      duration: plume.duration,
                      delay: plume.delay,
                      repeat: Infinity,
                      ease: "easeOut",
                    }}
                  />
                ))}

                {INPUT_GENIE_PARTICLES.map((particle) => (
                  <motion.div
                    key={particle.id}
                    className="absolute rounded-full"
                    style={{
                      left: particle.left,
                      top: particle.top,
                      width: particle.size,
                      height: particle.size,
                      background:
                        "radial-gradient(circle, rgba(255,227,133,0.9) 0%, rgba(104,199,255,0.35) 55%, transparent 100%)",
                      boxShadow: `0 0 ${particle.size * 3}px rgba(121, 213, 255, 0.18)`,
                    }}
                    animate={{
                      y: [0, -26, -48],
                      x: [0, particle.id % 2 === 0 ? 16 : -14, 0],
                      opacity: [0, 0.88, 0],
                      scale: [0.35, 1.25, 0.65],
                    }}
                    transition={{
                      duration: particle.duration,
                      delay: particle.delay,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                ))}
              </motion.div>

              <div className="relative z-10 w-full px-4">
                <WishInput
                  onSubmit={submitWish}
                  error={state.error}
                  isLoading={false}
                />
              </div>

              {/* Show previous result below input when returning from an error */}
              {state.error && state.result && (
                <motion.div
                  className="relative z-10 w-full mt-8 opacity-60"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 0.6, y: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  <WishResult result={state.result} onRetry={retry} />
                </motion.div>
              )}
            </motion.div>
          )}

          {/* LOADING */}
          {state.screen === "loading" && (
            <motion.div
              key="loading"
              className="w-full flex justify-center py-12"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WishLoading />
            </motion.div>
          )}

          {/* RESULT */}
          {state.screen === "result" && state.result && (
            <motion.div
              key="result"
              className="w-full py-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <WishResult result={state.result} onRetry={retry} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <motion.footer
        className="mt-auto pt-12 text-center space-y-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        {/* Ornamental divider */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold-400/15" />
          <div className="w-1 h-1 rounded-full bg-gold-400/20" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold-400/15" />
        </div>
        <p className="text-white/15 text-xs italic">
          Powered by a mildly annoyed genie and questionable AI
        </p>
        <p className="text-white/15 text-xs">
          Made by{" "}
          <a
            href="https://dev.to/jimzandueta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-400/30 hover:text-gold-400/60 transition-colors"
          >
            Jim Zandueta
          </a>
          {" · "}
          <a
            href="https://github.com/jimzandueta/cursed-powers"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-400/30 hover:text-gold-400/60 transition-colors"
          >
            GitHub
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
