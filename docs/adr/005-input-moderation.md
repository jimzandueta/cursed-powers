# ADR-005: Input Moderation Pipeline

**Status:** Accepted  
**Date:** 2026-04-03  
**Deciders:** Trust & Safety, Platform Engineering  
**Technical Story:** CURSED-67

## Context

Users submit free-text wishes to the platform. Without moderation, the AI could be prompted to generate harmful, offensive, or inappropriate content. The platform must ensure that:

1. User inputs are safe before being sent to AI providers
2. AI-generated outputs conform to content policy
3. The moderation system does not introduce unacceptable latency

The Cursed Powers platform generates intentionally absurd and humorous content, which complicates moderation — we must distinguish between "cursed but funny" (acceptable) and "genuinely harmful" (unacceptable).

## Decision

We will implement a **three-stage moderation pipeline**:

### Stage 1: Input Validation (Synchronous)

- Zod schema validation for structure and length constraints
- Maximum wish length: 200 characters
- Minimum wish length: 2 characters
- Honeypot field (`website`) must be empty (anti-bot)

### Stage 2: Content Moderation (Synchronous)

- Regex-based pattern matching for dangerous content
- Prompt injection detection: blocks system prompt manipulation, ignore instructions, etc.
- Disallowed content filtering: violence, explicit terms, slurs
- Themed rejection message: "The genie refuses to grant that wish."

### Stage 3: Output Validation (Post-Generation)

- AI response parsed against Zod schema (`WishResponseSchema`)
- Fields validated: `cursedPower`, `butClause`, `explanation`, `uselessnessScore`, `category`
- Malformed responses trigger retry with fallback provider

## Rationale

- **Defense in depth**: Multiple layers catch different types of problematic content
- **User experience**: Validation errors are returned immediately, before expensive AI calls
- **Content policy compliance**: Regex-based moderation runs in-process with zero external dependencies
- **Structured output**: Zod schemas ensure AI responses are well-formed before database insertion

## Consequences

### Positive

- Harmful content is blocked before AI generation (saves tokens)
- Consistent, themed error messages maintain the genie experience
- Post-generation validation prevents malformed data from reaching the gallery
- Moderation decisions are logged for audit purposes

### Negative

- Additional patterns must be maintained as new threats emerge
- False positives may block legitimate wishes (mitigated: patterns target specific harmful content)
- No external dependency for moderation (simpler but less comprehensive than ML-based approaches)

### Risks

- Regex evasion via Unicode or encoding tricks (mitigated: input is trimmed and normalized before matching)
- Adversarial prompt injection (mitigated: structured output schema constrains AI response format)
