"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WISH_MAX_LENGTH, WISH_MIN_LENGTH } from "@cursed-wishes/shared";

interface WishInputProps {
  onSubmit: (wish: string) => void;
  error: { code: string; message: string } | null;
  isLoading?: boolean;
}

export function WishInput({ onSubmit, error, isLoading }: WishInputProps) {
  const [wish, setWish] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const charCount = wish.trim().length;
  const isValid = charCount >= WISH_MIN_LENGTH && charCount <= WISH_MAX_LENGTH;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = wish.trim();

    if (trimmed.length < WISH_MIN_LENGTH) {
      setLocalError("Your wish is too short, mortal.");
      return;
    }

    if (trimmed.length > WISH_MAX_LENGTH) {
      setLocalError(`Wishes must be under ${WISH_MAX_LENGTH} characters.`);
      return;
    }

    setLocalError(null);
    onSubmit(trimmed);
  }

  const displayError = localError || (error ? error.message : null);
  const showShake = !!displayError;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="w-full max-w-lg mx-auto flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 25 }}
    >
      <div className="relative">
        <motion.input
          type="text"
          value={wish}
          onChange={(e) => {
            setWish(e.target.value);
            setLocalError(null);
          }}
          placeholder="I wish for..."
          maxLength={WISH_MAX_LENGTH}
          autoFocus
          className="w-full px-5 py-4 bg-mystic-800/60 border-2 border-gold-400/40 rounded-xl
                     text-white text-lg placeholder:text-white/30
                     focus:outline-none focus:border-gold-400/80 focus:glow-gold
                     transition-all duration-200"
          animate={showShake ? { x: [0, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
        />

        {/* Char count */}
        <span
          className={`absolute right-3 bottom-1.5 text-xs ${
            charCount > WISH_MAX_LENGTH * 0.9 ? "text-ember" : "text-white/30"
          }`}
        >
          {charCount}/{WISH_MAX_LENGTH}
        </span>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {displayError && (
          <motion.p
            className="text-ember text-sm text-center font-medium"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {displayError}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isLoading || !wish.trim()}
        className="px-8 py-4 bg-gradient-to-r from-gold-400 to-ember
                   text-mystic-900 font-display font-bold text-lg tracking-wide
                   rounded-xl glow-gold
                   hover:glow-gold-strong hover:scale-[1.02]
                   disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100
                   transition-all duration-200"
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? "Granting..." : "Grant My Wish"}
      </motion.button>
    </motion.form>
  );
}
