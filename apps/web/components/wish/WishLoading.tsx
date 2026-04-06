"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SPINNER_MESSAGES = [
  "The genie deliberates your fate...",
  "Consulting the ancient fine print...",
  "Finding the worst possible interpretation...",
  "The genie is laughing already...",
  "Searching for loopholes in your wish...",
  "Running your wish through the curse department...",
  "The genie's lawyers are reviewing this...",
  "Calculating maximum disappointment...",
  "Your wish is being weaponized...",
  "Loading creative cruelty...",
  "The genie is rubbing his hands together...",
  "Preparing something you'll deeply regret...",
  "Cross-referencing with 10,000 years of spite...",
  "Optimizing for emotional damage...",
  "This is going to be good (for the genie)...",
];

export function WishLoading() {
  const [messageIndex, setMessageIndex] = useState(() =>
    Math.floor(Math.random() * SPINNER_MESSAGES.length)
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => {
        let next;
        do {
          next = Math.floor(Math.random() * SPINNER_MESSAGES.length);
        } while (next === prev);
        return next;
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);
  return (
    <motion.div
      className="flex flex-col items-center gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Mystic orb */}
      <div className="relative w-36 h-36">
        {/* Outer ambient glow */}
        <motion.div
          className="absolute -inset-6 rounded-full blur-3xl"
          style={{ background: "radial-gradient(circle, rgba(139,92,246,0.25) 0%, rgba(232,185,35,0.08) 50%, transparent 70%)" }}
          animate={{ scale: [1, 1.3, 1], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Orb body */}
        <motion.div
          className="absolute inset-0 rounded-full border border-gold-400/20"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(167,139,250,0.3) 0%, rgba(30,6,64,0.9) 50%, rgba(7,0,17,0.95) 100%)",
            boxShadow: "0 0 20px rgba(124,58,237,0.3), inset 0 0 30px rgba(124,58,237,0.15)"
          }}
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          {/* Inner swirl 1 */}
          <motion.div
            className="absolute inset-3 rounded-full"
            style={{ background: "conic-gradient(from 0deg, transparent 0%, rgba(232,185,35,0.15) 25%, transparent 50%, rgba(139,92,246,0.1) 75%, transparent 100%)" }}
            animate={{ rotate: -360 }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
          />
          {/* Inner swirl 2 */}
          <motion.div
            className="absolute inset-6 rounded-full"
            style={{ background: "conic-gradient(from 180deg, transparent 0%, rgba(232,185,35,0.1) 30%, transparent 60%, rgba(167,139,250,0.08) 80%, transparent 100%)" }}
            animate={{ rotate: 360 }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Highlight reflection on orb */}
        <div
          className="absolute top-3 left-5 w-8 h-5 rounded-full opacity-30"
          style={{ background: "radial-gradient(ellipse, white 0%, transparent 70%)" }}
        />

        {/* Center spark */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [0.6, 1.2, 0.6], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <div className="w-3 h-3 rounded-full bg-gold-400" style={{ boxShadow: "0 0 12px rgba(232,185,35,0.8), 0 0 24px rgba(232,185,35,0.3)" }} />
        </motion.div>

        {/* Floating particles around orb */}
        {[0, 1, 2, 3].map((i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-gold-400/60"
            style={{
              top: "50%",
              left: "50%",
            }}
            animate={{
              x: [0, Math.cos((i * Math.PI) / 2) * 60, 0],
              y: [0, Math.sin((i * Math.PI) / 2) * 60, 0],
              opacity: [0, 0.8, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* Loading text */}
      <div className="text-center space-y-2">
        <div className="h-7 flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.p
              key={messageIndex}
              className="font-display text-gold-300/80 text-lg tracking-[0.15em] italic whitespace-nowrap"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {SPINNER_MESSAGES[messageIndex]}
            </motion.p>
          </AnimatePresence>
        </div>
        {/* Ornamental dots */}
        <div className="flex justify-center gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1 h-1 rounded-full bg-gold-400/40"
              animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
              transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.3 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}
