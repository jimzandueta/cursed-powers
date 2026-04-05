"use client";

import { motion } from "framer-motion";

interface LampProps {
  onRub: () => void;
  isHovered?: boolean;
}

export function Lamp({ onRub, isHovered }: LampProps) {
  return (
    <div className="flex flex-col items-center gap-8">
      <motion.div
        className="relative cursor-pointer select-none"
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        onClick={onRub}
        onTouchStart={onRub}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Glow effect behind lamp */}
        <motion.div
          className="absolute inset-0 -m-8 rounded-full bg-gold-400/20 blur-3xl"
          animate={{ opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Lamp SVG */}
        <svg
          width="200"
          height="140"
          viewBox="0 0 200 140"
          className="relative z-10 drop-shadow-2xl"
        >
          {/* Lamp body */}
          <ellipse cx="100" cy="95" rx="60" ry="25" fill="url(#lampGold)" />
          <ellipse
            cx="100"
            cy="90"
            rx="55"
            ry="22"
            fill="url(#lampGoldLight)"
          />

          {/* Lamp neck */}
          <path
            d="M 75 90 Q 70 60 85 45 Q 95 38 100 35"
            stroke="url(#lampGold)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
          />

          {/* Spout */}
          <path
            d="M 100 35 Q 110 30 125 28"
            stroke="url(#lampGold)"
            strokeWidth="6"
            fill="none"
            strokeLinecap="round"
          />

          {/* Lid */}
          <ellipse cx="75" cy="58" rx="12" ry="6" fill="url(#lampGoldLight)" />
          <ellipse cx="75" cy="56" rx="8" ry="4" fill="#f5c518" />

          {/* Handle */}
          <path
            d="M 130 75 Q 155 60 145 85"
            stroke="url(#lampGold)"
            strokeWidth="5"
            fill="none"
            strokeLinecap="round"
          />

          {/* Sparkle dots */}
          <motion.circle
            cx="85"
            cy="80"
            r="1.5"
            fill="white"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0 }}
          />
          <motion.circle
            cx="110"
            cy="85"
            r="1"
            fill="white"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.7 }}
          />
          <motion.circle
            cx="95"
            cy="100"
            r="1.5"
            fill="white"
            animate={{ opacity: [0, 1, 0] }}
            transition={{ duration: 2, repeat: Infinity, delay: 1.3 }}
          />

          {/* Smoke wisps from spout */}
          <motion.path
            d="M 125 26 Q 130 15 127 5"
            stroke="rgba(45, 212, 191, 0.3)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            animate={{ opacity: [0, 0.5, 0], y: [0, -5, -10] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <motion.path
            d="M 127 24 Q 135 12 130 2"
            stroke="rgba(45, 212, 191, 0.2)"
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            animate={{ opacity: [0, 0.4, 0], y: [0, -4, -8] }}
            transition={{ duration: 3, repeat: Infinity, delay: 1 }}
          />

          {/* Gradients */}
          <defs>
            <linearGradient id="lampGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f5c518" />
              <stop offset="50%" stopColor="#d4a017" />
              <stop offset="100%" stopColor="#b8860b" />
            </linearGradient>
            <linearGradient
              id="lampGoldLight"
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
      </motion.div>

      {/* CTA Text */}
      <motion.p
        className="font-display text-lg text-gold-400/80 tracking-wider text-glow"
        animate={{ opacity: [0.6, 1, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        Rub the lamp, if you dare
      </motion.p>
    </div>
  );
}
