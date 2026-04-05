"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface GenieProps {
  onRevealed: () => void;
}

export function Genie({ onRevealed }: GenieProps) {
  const [showText, setShowText] = useState(false);
  const [textComplete, setTextComplete] = useState(false);
  const message =
    "You have summoned me. What superpower do you desire, mortal?";
  const [displayedText, setDisplayedText] = useState("");

  useEffect(() => {
    // Start text typewriter after genie appears
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
        setTimeout(onRevealed, 600);
      }
    }, 40);

    return () => clearInterval(interval);
  }, [showText, onRevealed]);

  return (
    <div className="flex flex-col items-center gap-6">
      {/* Smoke burst */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.8, 0.3] }}
        transition={{ duration: 1.5, times: [0, 0.3, 1] }}
      >
        <div className="w-80 h-80 rounded-full bg-gradient-radial from-teal-400/30 via-purple-500/10 to-transparent blur-3xl" />
      </motion.div>

      {/* Genie character */}
      <motion.div
        className="relative"
        initial={{ scale: 0.3, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          stiffness: 200,
          damping: 20,
          duration: 0.8,
        }}
      >
        <svg
          width="160"
          height="200"
          viewBox="0 0 160 200"
          className="drop-shadow-2xl"
        >
          {/* Smoke trail / lower body */}
          <motion.path
            d="M 60 200 Q 50 170 65 150 Q 80 130 80 120 Q 80 110 80 100"
            stroke="url(#smokeGrad)"
            strokeWidth="30"
            fill="none"
            strokeLinecap="round"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.6 }}
            transition={{ duration: 1 }}
          />

          {/* Body */}
          <motion.ellipse
            cx="80"
            cy="100"
            rx="35"
            ry="30"
            fill="url(#genieBody)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3, type: "spring" }}
          />

          {/* Head */}
          <motion.circle
            cx="80"
            cy="60"
            r="25"
            fill="url(#genieBody)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring" }}
          />

          {/* Eyes - slightly bored/smug expression */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            {/* Left eye */}
            <ellipse cx="72" cy="57" rx="4" ry="3" fill="white" />
            <circle cx="73" cy="57" r="2" fill="#1a0533" />
            {/* Right eye */}
            <ellipse cx="88" cy="57" rx="4" ry="3" fill="white" />
            <circle cx="89" cy="57" r="2" fill="#1a0533" />
            {/* Smug eyebrow */}
            <path
              d="M 65 50 Q 72 46 78 50"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M 82 50 Q 88 44 95 49"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
            {/* Smirk */}
            <path
              d="M 72 68 Q 80 74 88 68"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
            />
          </motion.g>

          {/* Arms crossed */}
          <motion.g
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <path
              d="M 45 95 Q 35 85 50 80"
              stroke="url(#genieBody)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
            <path
              d="M 115 95 Q 125 85 110 80"
              stroke="url(#genieBody)"
              strokeWidth="10"
              fill="none"
              strokeLinecap="round"
            />
          </motion.g>

          {/* Turban / top of head */}
          <motion.path
            d="M 55 50 Q 60 25 80 20 Q 100 25 105 50"
            fill="url(#turbanGold)"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
          />
          <motion.circle
            cx="80"
            cy="22"
            r="5"
            fill="#f5c518"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.6, type: "spring" }}
          />

          <defs>
            <linearGradient id="genieBody" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6b21a8" />
              <stop offset="50%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="#6b21a8" />
            </linearGradient>
            <linearGradient id="smokeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#7c3aed" />
              <stop offset="100%" stopColor="transparent" />
            </linearGradient>
            <linearGradient id="turbanGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5c518" />
              <stop offset="100%" stopColor="#d4a017" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Speech bubble with typewriter text */}
      <AnimatePresence>
        {showText && (
          <motion.div
            className="max-w-md mx-auto px-6 py-4 bg-mystic-800/80 border border-gold-400/30 rounded-2xl backdrop-blur-sm"
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <p className="font-display text-center text-gold-300 text-lg leading-relaxed">
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
