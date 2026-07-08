import dns from 'dns';
import { URL } from 'url';

const PRIVATE_RANGES = [
  /^127\./,                       // loopback
  /^10\./,                        // Class A private
  /^172\.(1[6-9]|2\d|3[01])\./,  // Class B private
  /^192\.168\./,                  // Class C private
  /^169\.254\./,                  // link-local
  /^0\./,                         // current network
  /^::1$/,                        // IPv6 loopback
  /^fc00:/,                       // IPv6 ULA
  /^fe80:/,                       // IPv6 link-local
  /^localhost$/i,
];

function isPrivateIP(hostname) {
  return PRIVATE_RANGES.some((re) => re.test(hostname));
}

/**
 * Validate a URL is safe to fetch (not targeting private/internal IPs).
 * @param {string} urlString
 * @returns {{ safe: boolean, error?: string }}
 */
export async function validateUrl(urlString) {
  let parsed;
  try {
    parsed = new URL(urlString);
  } catch {
    return { safe: false, error: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { safe: false, error: 'Only HTTP and HTTPS URLs are allowed' };
  }

  const hostname = parsed.hostname;

  // Quick check for obviously private hostnames
  if (isPrivateIP(hostname)) {
    return { safe: false, error: 'Auditing private/internal URLs is not allowed' };
  }

  // DNS resolution check — block private IPs that DNS might resolve to
  try {
    const addresses = await dns.promises.resolve4(hostname);
    for (const addr of addresses) {
      if (isPrivateIP(addr)) {
        return {
          safe: false,
          error: `URL resolves to a private IP (${addr}). Auditing internal resources is not allowed.`,
        };
      }
    }
  } catch {
    // DNS resolution failed — let the audit tools handle it (connectivity check catches it)
  }

  return { safe: true };
}
