/**
 * Magic link token generation and verification.
 *
 * Uses HMAC-SHA256 via the Web Crypto API — compatible with both the
 * Next.js Edge runtime (middleware) and Node.js 18+ (API routes / server
 * components).
 *
 * Token format:  <base64url(JSON payload)>.<base64url(HMAC-SHA256 signature)>
 * Payload:       { partner: string, exp: number }  (unix seconds)
 *
 * Production:  set PARTNER_LINK_SECRET to a long random string.
 * Default:     a dev-only fallback (NEVER use in production).
 */

const EXPIRY_HOURS = 48

function secret(): string {
  const s = process.env.PARTNER_LINK_SECRET
  if (!s) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        'PARTNER_LINK_SECRET env var is required in production. ' +
        'Generate with: openssl rand -base64 32'
      )
    }
    // Dev-only fallback — magic links will verify correctly within a single
    // dev session but tokens are not portable across restarts.
    return 'yonder-dev-secret-CHANGE-ME-in-production'
  }
  return s
}

async function importKey(s: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(s),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  )
}

function b64url(buf: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(buf)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
}

function b64urlDecode(s: string): ArrayBuffer {
  const bytes = Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0))
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer
}

export interface TokenPayload {
  /** Canonical partner_name, e.g. "FRIVE" */
  partner: string
  /** Unix timestamp (seconds) at which the token expires */
  exp: number
}

/**
 * Generate a 48-hour HMAC-signed magic link token for a partner.
 */
export async function generateMagicToken(partnerName: string): Promise<string> {
  const payload: TokenPayload = {
    partner: partnerName,
    exp: Math.floor(Date.now() / 1000) + EXPIRY_HOURS * 3600,
  }
  const enc = new TextEncoder()
  const payloadB64 = b64url(enc.encode(JSON.stringify(payload)).buffer as ArrayBuffer)
  const key = await importKey(secret())
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(payloadB64))
  return `${payloadB64}.${b64url(sig)}`
}

/**
 * Verify and decode a magic link token.
 * Returns null if signature is invalid, token is malformed, or token has expired.
 */
export async function verifyMagicToken(token: string): Promise<TokenPayload | null> {
  try {
    const dot = token.lastIndexOf('.')
    if (dot === -1) return null
    const payloadB64 = token.slice(0, dot)
    const sigB64 = token.slice(dot + 1)

    const key = await importKey(secret())
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      b64urlDecode(sigB64),
      new TextEncoder().encode(payloadB64),
    )
    if (!valid) return null

    const payload: TokenPayload = JSON.parse(
      new TextDecoder().decode(b64urlDecode(payloadB64)),
    )
    if (payload.exp < Math.floor(Date.now() / 1000)) return null
    return payload
  } catch {
    return null
  }
}
