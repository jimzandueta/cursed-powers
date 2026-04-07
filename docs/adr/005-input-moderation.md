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
- Character allowlist: alphanumeric, spaces, basic punctuation

### Stage 2: Content Moderation (Synchronous)

- OpenAI Moderation API for input classification
- Categories checked: hate, violence, self-harm, sexual content
- Threshold: Any category flag triggers rejection
- Themed rejection message: "The genie refuses to grant that wish."

### Stage 3: Output Validation (Post-Generation)

- AI response parsed against Zod schema (`WishResponseSchema`)
- Fields validated: `cursedPower`, `butClause`, `explanation`, `uselessnessScore`, `category`
- Malformed responses trigger retry with fallback provider

## Rationale

- **Defense in depth**: Multiple layers catch different types of problematic content
- **User experience**: Validation errors are returned immediately, before expensive AI calls
- **Content policy compliance**: OpenAI's moderation API is industry-standard and free to use
- **Structured output**: Zod schemas ensure AI responses are well-formed before database insertion

## Consequences

### Positive

- Harmful content is blocked before AI generation (saves tokens)
- Consistent, themed error messages maintain the genie experience
- Post-generation validation prevents malformed data from reaching the gallery
- Moderation decisions are logged for audit purposes

### Negative

- Additional latency from moderation API call (~100-200ms)
- False positives may block legitimate wishes (mitigated: generous thresholds)
- OpenAI Moderation API dependency even when using Gemini as primary provider

### Risks

- Moderation API outage blocks all wish generation (mitigated: moderation failure falls through with warning log, not hard block)
- Adversarial prompt injection (mitigated: structured output schema constrains AI response format)
