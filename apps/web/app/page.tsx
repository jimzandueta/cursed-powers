"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useWishFlow } from "../hooks/useWishFlow";
import { Lamp } from "../components/lamp/Lamp";
import { LampRubbing } from "../components/lamp/LampRubbing";
import { Genie } from "../components/genie/Genie";
import { WishInput } from "../components/wish/WishInput";
import { WishLoading } from "../components/wish/WishLoading";
import { WishResult } from "../components/wish/WishResult";

export default function Home() {
  const {
    state,
    startRub,
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
        <h1 className="font-display text-4xl md:text-6xl font-bold text-gold-400 text-glow mb-2">
          Cursed Wishes
        </h1>
        <p className="text-white/40 text-sm md:text-base tracking-wider">
          Every superpower has a catch
        </p>
      </motion.div>

      {/* Main content area */}
      <div className="relative w-full max-w-2xl mx-auto flex flex-col items-center min-h-[400px] justify-center">
        <AnimatePresence mode="wait">
          {/* IDLE - Show lamp */}
          {state.screen === "idle" && (
            <motion.div
              key="idle"
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3 }}
            >
              <Lamp onRub={startRub} />
            </motion.div>
          )}

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
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
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
              <div className="flex justify-center mb-8">
                <svg
                  width="60"
                  height="75"
                  viewBox="0 0 160 200"
                  className="opacity-60"
                >
                  <ellipse cx="80" cy="100" rx="35" ry="30" fill="#6b21a8" />
                  <circle cx="80" cy="60" r="25" fill="#7c3aed" />
                  <ellipse cx="72" cy="57" rx="4" ry="3" fill="white" />
                  <circle cx="73" cy="57" r="2" fill="#1a0533" />
                  <ellipse cx="88" cy="57" rx="4" ry="3" fill="white" />
                  <circle cx="89" cy="57" r="2" fill="#1a0533" />
                  <path
                    d="M 72 68 Q 80 74 88 68"
                    stroke="white"
                    strokeWidth="1.5"
                    fill="none"
                  />
                  <path
                    d="M 55 50 Q 60 25 80 20 Q 100 25 105 50"
                    fill="#d4a017"
                  />
                  <circle cx="80" cy="22" r="5" fill="#f5c518" />
                </svg>
              </div>

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
        className="mt-auto pt-12 text-center text-white/20 text-xs space-y-1"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        <p>Powered by a mildly annoyed genie and questionable AI</p>
        <p>
          Made by{" "}
          <a
            href="https://dev.to/jimzandueta"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-400/40 hover:text-gold-400/70 transition-colors"
          >
            Jim Zandueta
          </a>
          {" · "}
          <a
            href="https://github.com/jimzandueta/genie"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold-400/40 hover:text-gold-400/70 transition-colors"
          >
            GitHub
          </a>
        </p>
      </motion.footer>
    </div>
  );
}
