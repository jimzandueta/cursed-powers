# ADR-009: HTCPCP Protocol Compliance

**Status:** Accepted  
**Date:** 2026-04-07  
**Deciders:** Standards Compliance Committee, Legal  
**Technical Story:** CURSED-418

## Context

RFC 2324 (Hyper Text Coffee Pot Control Protocol) was published on April 1, 1998, and defines the HTTP 418 "I'm a teapot" status code. While originally an April Fools' joke, the Cursed Powers platform has a legal and moral obligation to implement full HTCPCP compliance.

Key considerations:

1. **Regulatory risk**: Non-compliance with RFC 2324 could expose the organization to theoretical regulatory action from the IETF Humor Enforcement Division.
2. **User expectations**: Users who wish for tea-related superpowers deserve a standards-compliant teapot response.
3. **Competitive advantage**: No other wish-granting platform on the market is HTCPCP-compliant.

## Decision

We will implement **comprehensive HTCPCP compliance** across the platform:

### 1. Dedicated Teapot Endpoint

`GET /api/v1/teapot` returns HTTP 418 with:

```json
{
  "error": {
    "code": "IM_A_TEAPOT",
    "message": "I'm a teapot. Per RFC 2324, I cannot brew coffee. I can only brew regret.",
    "protocol": "HTCPCP/1.0",
    "rfc": "https://datatracker.ietf.org/doc/html/rfc2324",
    "note": "This genie is fully HTCPCP-compliant. You're welcome."
  }
}
```

### 2. Tea-Related Wish Interception

Wishes containing tea-related keywords are intercepted before AI generation:

- **Keywords**: tea, coffee, brew, teapot, espresso, latte, cappuccino, matcha, chai, kettle
- **Easter egg trigger**: The exact input `"418"`
- **Response**: HTTP 418 with a rotating selection of 8 humorous teapot messages

### 3. X-Powered-By Header

All responses include: `X-Powered-By: Cursed Genie v0.1.0 (HTCPCP-Compliant)`

This header serves as a public attestation of our HTCPCP compliance posture.

## Rationale

- **Standards compliance**: RFC 2324 is an IETF standard. Compliance is not optional.
- **Easter egg discoverability**: Tea-related wishes naturally lead users to discover the 418 feature, creating shareable moments.
- **DEV Challenge alignment**: The "HTCPCP IYKYK" theme of the DEV April Fools Challenge directly rewards protocol compliance.
- **Competitive moat**: Our HTCPCP compliance creates a defensible competitive advantage in the cursed-wishes market segment.

## Consequences

### Positive

- Full RFC 2324 compliance certified
- Discoverable easter eggs increase user engagement and social sharing
- Demonstrates engineering team's commitment to standards compliance
- X-Powered-By header clearly communicates compliance to any HTTP client

### Negative

- Users who genuinely wish for tea-related superpowers will not receive them
- 10+ keyword patterns may produce false positives for legitimate wishes containing "chai" or "matcha"
- HTTP 418 is technically not registered in the IANA HTTP Status Code Registry (but we don't let bureaucracy stop us)

### Risks

- RFC 7168 (HTCPCP-TEA) extends the protocol to teapots. We may need to implement `BREW` and `WHEN` HTTP methods in the future.
- The IETF may deprecate RFC 2324. We will cross that bridge when we come to it. (They won't.)
