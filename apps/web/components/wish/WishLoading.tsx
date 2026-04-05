"use client";

import { motion } from "framer-motion";

export function WishLoading() {
  return (
    <motion.div
      className="flex flex-col items-center gap-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {/* Crystal ball / vortex effect */}
      <div className="relative w-32 h-32">
        {/* Outer glow */}
        <motion.div
          className="absolute inset-0 rounded-full bg-purple-500/20 blur-2xl"
          animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 2, repeat: Infinity }}
        />

        {/* Orb */}
        <motion.div
          className="absolute inset-2 rounded-full bg-gradient-to-br from-purple-500/40 via-mystic-700 to-teal-500/30 border border-gold-400/30"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
        >
          {/* Inner swirls */}
          <motion.div
            className="absolute inset-4 rounded-full bg-gradient-to-tr from-gold-400/20 to-transparent"
            animate={{ rotate: -360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        </motion.div>

        {/* Center spark */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center"
          animate={{ scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          <div className="w-3 h-3 rounded-full bg-gold-400 blur-sm" />
        </motion.div>
      </div>

      {/* Loading text */}
      <motion.p
        className="font-display text-gold-400/70 text-lg tracking-wider text-center"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        The genie deliberates your fate...
      </motion.p>
    </motion.div>
  );
}
