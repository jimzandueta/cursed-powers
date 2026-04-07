"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import type { WishResult as WishResultType } from "@cursed-wishes/shared";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getScoreVerdict(score: number): { label: string; emoji: string; color: string } {
  if (score >= 97) return { label: "You're Worse Off Than Before", emoji: "💀", color: "text-red-400" };
  if (score >= 93) return { label: "Completely Useless", emoji: "😭", color: "text-red-400" };
  if (score >= 88) return { label: "Barely a Superpower", emoji: "🤡", color: "text-ember" };
  if (score >= 82) return { label: "Technically Counts", emoji: "😐", color: "text-gold-400" };
  if (score >= 76) return { label: "Could Be Worse", emoji: "🫠", color: "text-gold-300" };
  return { label: "The Genie Messed Up", emoji: "🤨", color: "text-green-400" };
}

const COMMENTS: Record<string, string[]> = {
  "97+": [
    "Even the genie feels a little bad about this one.",
    "Scientists would study this level of disappointment.",
    "This is the superpower equivalent of a participation trophy.",
    "Somewhere, a monkey's paw just slow-clapped.",
    "You didn't just get cursed. You got curriculum-vitae'd by the universe.",
    "This wish is now being used as a cautionary tale in genie school.",
    "The fine print was printed in invisible ink. On fire.",
    "Congratulations, you've unlocked a new tier of regret.",
    "Your ancestors are pretending they don't know you.",
    "The genie is updating his LinkedIn after this one.",
  ],
  "93": [
    "Your enemies would feel sorry for you.",
    "This power would get rejected from a blooper reel.",
    "Even autocorrect couldn't fix this wish.",
    "You'd lose a superpower contest to a regular person.",
    "The genie is trying very hard not to laugh.",
    "This wish has negative street cred.",
    "Support groups exist for less tragic outcomes.",
    "Your superhero name would be Captain Disappointment.",
    "Marvel wouldn't even put you in the post-credits scene.",
    "The universe just sent you a 'sorry for your loss' card.",
  ],
  "88": [
    "Technically not a war crime.",
    "The genie's lawyer says this is legally a power.",
    "You could list this on LinkedIn under 'Special Skills.'",
    "At least it makes a great icebreaker at parties. Sad parties.",
    "This power has theoretical value. Very theoretical.",
    "Somewhere, a very niche subreddit is celebrating.",
    "The genie did the bare minimum, and it shows.",
    "Wikipedia would file this under 'See Also: Regret.'",
    "It's not worthless—it's priceless. As in nobody would pay for it.",
    "This power is one step above a firm handshake.",
  ],
  "82": [
    "Your résumé just got... interesting.",
    "It's like a Swiss Army knife, but only the toothpick works.",
    "The power company called. They don't consider this energy.",
    "Hey, at least it's technically more than nothing.",
    "You're now slightly more powerful than a houseplant.",
    "Under very specific conditions, this might impress someone's grandma.",
    "The genie shrugged and called it a day.",
    "Useful if you define 'useful' very, very loosely.",
    "It's not a bug, it's a feature. A bad feature.",
    "This power would get three stars on Yelp. From your mom.",
  ],
  "76": [
    "There might be a niche use case. Maybe.",
    "In a parallel universe, this is slightly less embarrassing.",
    "The genie actually hesitated before granting this one.",
    "If you squint hard enough, this could be helpful.",
    "Not the worst wish ever granted. Top 50, though.",
    "Someone somewhere would trade their power for this. Probably.",
    "The genie considered being generous, then remembered who he is.",
    "This is the participation award of superpowers.",
    "A very generous person might call this 'situationally adequate.'",
    "Almost cool. Like a mullet.",
  ],
  "low": [
    "Wait, this might actually be useful? Impossible.",
    "The genie is requesting a do-over.",
    "Hold on, did the genie accidentally grant a real power?",
    "Error 404: Curse not devastating enough.",
    "This feels like a clerical error in the cosmic bureaucracy.",
    "The genie union is filing a complaint about this one.",
    "Something went wrong. You might actually enjoy this.",
    "The other genies are going to roast him for this.",
    "Suspiciously useful. The genie might be losing his touch.",
    "Quick, make another wish before he realizes his mistake.",
  ],
};

function getScoreComment(score: number): string {
  if (score >= 97) return pick(COMMENTS["97+"]);
  if (score >= 93) return pick(COMMENTS["93"]);
  if (score >= 88) return pick(COMMENTS["88"]);
  if (score >= 82) return pick(COMMENTS["82"]);
  if (score >= 76) return pick(COMMENTS["76"]);
  return pick(COMMENTS["low"]);
}

interface WishResultProps {
  result: WishResultType;
  onRetry: () => void;
}

export function WishResult({ result, onRetry }: WishResultProps) {
  const [showScore, setShowScore] = useState(false);
  const [revealedText, setRevealedText] = useState("");
  const [comment] = useState(() => getScoreComment(result.uselessnessScore));

  // Word-by-word reveal for cursed power
  useEffect(() => {
    const words = result.cursedPower.split(" ");
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setRevealedText(words.slice(0, i).join(" "));
      if (i >= words.length) {
        clearInterval(interval);
        setTimeout(() => setShowScore(true), 400);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [result.cursedPower]);

  return (
    <motion.div
      className="w-full max-w-lg mx-auto flex flex-col gap-6"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      {/* Result card */}
      <div className="bg-mystic-800/50 border border-gold-400/15 rounded-2xl p-8 backdrop-blur-sm relative overflow-hidden"
        style={{ boxShadow: "0 0 40px rgba(124,58,237,0.06), inset 0 0 30px rgba(0,0,0,0.3)" }}
      >
        {/* Decorative corner accents */}
        <div className="absolute top-3 left-4 w-5 h-5 border-t border-l border-gold-400/15 rounded-tl-sm" />
        <div className="absolute top-3 right-4 w-5 h-5 border-t border-r border-gold-400/15 rounded-tr-sm" />
        <div className="absolute bottom-3 left-4 w-5 h-5 border-b border-l border-gold-400/15 rounded-bl-sm" />
        <div className="absolute bottom-3 right-4 w-5 h-5 border-b border-r border-gold-400/15 rounded-br-sm" />

        {/* Original wish - crossed out */}
        <p className="text-white/30 text-sm line-through mb-3 italic">
          You wished for: {result.originalWish}
        </p>

        {/* Category tag */}
        <motion.span
          className="inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider
                     bg-purple-500/20 text-purple-300 rounded-full mb-4"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          {result.category}
        </motion.span>

        {/* Cursed power - dramatic reveal
            Invisible copy establishes final height; visible copy typewriters in on top */}
        <div className="relative mb-4">
          <h2
            className="font-display text-2xl md:text-3xl font-bold leading-tight invisible select-none"
            aria-hidden="true"
          >
            {result.cursedPower}
          </h2>
          <h2 className="font-display text-2xl md:text-3xl font-bold text-gold-400 text-glow leading-tight absolute inset-0">
            {revealedText}
            {revealedText !== result.cursedPower && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.3, repeat: Infinity }}
                className="ml-1"
              >
                |
              </motion.span>
            )}
          </h2>
        </div>

        {/* Explanation — same technique */}
        <div className="relative">
          <p
            className="font-display text-sm leading-relaxed italic invisible select-none"
            aria-hidden="true"
          >
            &ldquo;{result.explanation}&rdquo;
          </p>
          <motion.p
            className="font-display text-white/60 text-sm leading-relaxed italic absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
          >
            &ldquo;{result.explanation}&rdquo;
          </motion.p>
        </div>

        {/* Uselessness verdict */}
        {showScore && (
          <motion.div
            className="mt-6 pt-4 border-t border-white/5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Verdict */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <span className="text-2xl">{getScoreVerdict(result.uselessnessScore).emoji}</span>
              <span className={`font-display text-base font-bold tracking-wide ${getScoreVerdict(result.uselessnessScore).color}`}>
                {getScoreVerdict(result.uselessnessScore).label}
              </span>
            </motion.div>

            {/* Funny comment */}
            <motion.p
              className="text-white/30 text-xs mt-1.5 italic pl-9"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {comment}
            </motion.p>
          </motion.div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3 justify-center">
        <motion.button
          onClick={onRetry}
          className="px-6 py-3 bg-gradient-to-r from-gold-400 to-ember
                     text-mystic-900 font-display font-bold tracking-widest
                     rounded-xl glow-gold hover:glow-gold-strong hover:scale-[1.02]
                     transition-all duration-200"
          whileTap={{ scale: 0.98 }}
        >
          Wish Again
        </motion.button>

        <motion.button
          onClick={() => {
            const text = `I wished for "${result.originalWish}" and got: ${result.cursedPower}\n\n${result.explanation}\n\nUselessness: ${result.uselessnessScore}%`;
            navigator.clipboard?.writeText(text);
          }}
          className="px-6 py-3 border border-gold-400/20 text-gold-400/80
                     font-display font-bold tracking-widest rounded-xl
                     hover:bg-gold-400/5 hover:border-gold-400/40 hover:text-gold-400 transition-all duration-200"
          whileTap={{ scale: 0.98 }}
        >
          Copy
        </motion.button>
      </div>
    </motion.div>
  );
}
