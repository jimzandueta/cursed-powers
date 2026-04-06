"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWishFlow } from "../hooks/useWishFlow";
import { LampRubbing } from "../components/lamp/LampRubbing";
import { Genie } from "../components/genie/Genie";
import { WishInput } from "../components/wish/WishInput";
import { WishLoading } from "../components/wish/WishLoading";
import { WishResult } from "../components/wish/WishResult";

export default function Home() {
  const {
    state,

    updateRub,
    revealGenie,
    showInput,
    submitWish,
    retry,
  } = useWishFlow();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Title - always visible */}
      <motion.div
        className="text-center mb-12"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <h1 className="font-display text-4xl md:text-6xl font-bold text-gold-400 text-glow mb-3 tracking-wide">
          Cursed Powers
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
          Every superpower has a catch™
        </p>
      </motion.div>

      {/* Main content area */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center min-h-[400px] justify-center">
        <AnimatePresence mode="wait">
          {/* RUBBING - Interactive lamp */}
          {state.screen === "rubbing" && (
            <motion.div
              key="rubbing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              transition={{ duration: 0.3 }}
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 0.15, y: 40 }}
              transition={{ duration: 0.4, ease: "easeIn" }}
            >
              <Genie onRevealed={showInput} />
            </motion.div>
          )}

          {/* INPUT */}
          {state.screen === "input" && (
            <motion.div
              key="input"
              className="w-full"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Mini genie stays visible */}
              <motion.div
                className="flex justify-center mb-8"
                initial={{ scale: 3, opacity: 0.9, y: 80 }}
                animate={{ scale: 1, opacity: 0.5, y: 0 }}
                transition={{
                  type: "spring",
                  stiffness: 260,
                  damping: 18,
                  mass: 0.8,
                }}
              >
                <img
                  src="/images/genie.png"
                  alt="Genie"
                  width={80}
                  height={130}
                  draggable={false}
                />
              </motion.div>

              <WishInput
                onSubmit={submitWish}
                error={state.error}
                isLoading={false}
              />

              {/* Show previous result below input when returning from an error */}
              {state.error && state.result && (
                <motion.div
                  className="w-full mt-8 opacity-60"
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
              className="w-full"
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
            href="https://github.com/jimzandueta/genie"
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
