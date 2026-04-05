/** @type {import("@commitlint/types").UserConfig} */
export default {
  extends: ["@commitlint/config-conventional"],
  rules: {
    // ── Scope Enforcement ────────────────────────────────────────────
    // Because even commit scopes need governance in an enterprise-grade
    // cursed wish generator.
    "scope-enum": [
      2,
      "always",
      [
        // Real scopes (for actual engineering work)
        "api",
        "web",
        "shared",
        "infra",
        "docs",
        "deps",
        "ci",
        "docker",
        "terraform",

        // On-brand scopes (for maximum over-engineering comedy)
        "genie",
        "lamp",
        "wishes",
        "teapot",
        "curses",
        "htcpcp",
        "circuit-breaker",
        "moderation",
      ],
    ],
    "scope-empty": [1, "never"], // Warn if no scope — we're enterprise here

    // ── Type Enforcement ─────────────────────────────────────────────
    "type-enum": [
      2,
      "always",
      [
        "feat",     // New cursed feature
        "fix",      // Un-curse a bug
        "docs",     // Scroll of documentation
        "chore",    // Genie housekeeping
        "refactor", // Rearrange the curse architecture
        "perf",     // Make curses faster
        "test",     // Verify curse delivery
        "ci",       // Pipeline sorcery
        "build",    // Forge the artifacts
        "style",    // Polish the lamp
        "revert",   // Undo a wish (rare)
      ],
    ],

    // ── Message Rules ────────────────────────────────────────────────
    "subject-case": [2, "never", ["start-case", "pascal-case", "upper-case"]],
    "subject-empty": [2, "never"],
    "subject-full-stop": [2, "never", "."],
    "header-max-length": [2, "always", 100],
    "body-max-line-length": [2, "always", 200],
  },
};
