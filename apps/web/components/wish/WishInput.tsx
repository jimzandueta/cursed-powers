"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Turnstile, type TurnstileInstance } from "@marsidev/react-turnstile";
import { WISH_MAX_LENGTH, WISH_MIN_LENGTH } from "@cursed-wishes/shared";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

interface WishInputProps {
  onSubmit: (wish: string, turnstileToken?: string) => void;
  error: { code: string; message: string } | null;
  isLoading?: boolean;
}

export function WishInput({ onSubmit, error, isLoading }: WishInputProps) {
  const [wish, setWish] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | undefined>();
  const turnstileRef = useRef<TurnstileInstance | null>(null);

  const charCount = wish.trim().length;

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
    onSubmit(trimmed, turnstileToken);

    // Reset Turnstile for next submission
    turnstileRef.current?.reset();
    setTurnstileToken(undefined);
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
        {/* Honeypot field — invisible to humans, auto-filled by bots */}
        <input
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          style={{ position: "absolute", left: "-9999px", opacity: 0, height: 0, width: 0 }}
          onChange={() => {}}
        />
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
          className="w-full px-6 py-4 bg-mystic-800/50 border border-gold-400/25 rounded-xl
                     text-white text-lg font-display tracking-wide placeholder:text-white/25 placeholder:italic
                     focus:outline-none focus:border-gold-400/60 focus:glow-gold
                     transition-all duration-300"
          style={{
            boxShadow: "inset 0 2px 8px rgba(0,0,0,0.3)"
          }}
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

      {/* Cloudflare Turnstile — invisible CAPTCHA */}
      {TURNSTILE_SITE_KEY && (
        <Turnstile
          ref={turnstileRef}
          siteKey={TURNSTILE_SITE_KEY}
          onSuccess={setTurnstileToken}
          onError={() => setTurnstileToken(undefined)}
          onExpire={() => setTurnstileToken(undefined)}
          options={{ theme: "dark", size: "invisible" }}
        />
      )}

      {/* Submit button */}
      <motion.button
        type="submit"
        disabled={isLoading || !wish.trim()}
        className="px-8 py-4 bg-gradient-to-r from-gold-400 to-ember
                   text-mystic-900 font-display font-bold text-lg tracking-wider
                   rounded-xl glow-gold
                   hover:glow-gold-strong hover:scale-[1.02]
                   disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100
                   transition-all duration-200"
        whileTap={{ scale: 0.98 }}
      >
        {isLoading ? "Granting..." : "Grant My Wish"}
      </motion.button>
    </motion.form>
  );
}
