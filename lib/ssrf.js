import dns from 'dns';
import { URL } from 'url';

/**
 * Validate a URL and block private/internal IP ranges to prevent SSRF.
 * Returns { valid: true, url } or { valid: false, reason }.
 *
 * DNS resolution failures are NOT blocked here — the connectivity check
 * handles those. This only blocks URLs that resolve to private/reserved IPs.
 */
export async function validateUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }

  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return { valid: false, reason: 'Only HTTP and HTTPS URLs are allowed' };
  }

  const hostname = parsed.hostname.toLowerCase();
  const blockedHostnames = [
    'localhost',
    '127.0.0.1',
    '0.0.0.0',
    '::1',
    'metadata.google.internal',
    '169.254.169.254',
  ];
  if (blockedHostnames.includes(hostname)) {
    return { valid: false, reason: 'Access to internal/metadata endpoints is blocked' };
  }

  // DNS resolve and check for private/reserved IPs (both IPv4 and IPv6)
  try {
    const addresses = await dns.promises.resolve4(hostname);
    for (const addr of addresses) {
      if (isPrivateIPv4(addr)) {
        return {
          valid: false,
          reason: `URL resolves to a private/reserved IP (${addr}). SSRF protection active.`,
        };
      }
    }
  } catch {
    // IPv4 resolution failed — try IPv6
  }

  try {
    const addresses6 = await dns.promises.resolve6(hostname);
    for (const addr of addresses6) {
      if (isPrivateIPv6(addr)) {
        return {
          valid: false,
          reason: `URL resolves to a private/reserved IPv6 (${addr}). SSRF protection active.`,
        };
      }
    }
  } catch {
    // IPv6 resolution also failed — let connectivity check handle it
  }

  return { valid: true, url: parsed.href };
}

function isPrivateIPv4(ip) {
  const parts = ip.split('.').map(Number);
  if (parts[0] === 127) return true;
  if (parts[0] === 10) return true;
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
  if (parts[0] === 192 && parts[1] === 168) return true;
  if (parts[0] === 169 && parts[1] === 254) return true;
  if (parts[0] === 0) return true;
  if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;
  if (parts[0] === 192 && parts[1] === 0) return true;
  if (parts[0] === 192 && parts[1] === 0 && parts[2] === 2) return true;
  if (parts[0] === 198 && parts[1] === 51 && parts[2] === 100) return true;
  if (parts[0] === 203 && parts[1] === 0 && parts[2] === 113) return true;
  if (parts[0] >= 224 && parts[0] <= 239) return true;
  if (parts[0] >= 240) return true;
  return false;
}

function isPrivateIPv6(ip) {
  const lower = ip.toLowerCase();
  if (lower === '::1' || lower === '0:0:0:0:0:0:0:1') return true;
  if (lower === '::' || lower === '0:0:0:0:0:0:0:0') return true;
  if (lower.startsWith('fe80:') || lower.startsWith('fe9') || lower.startsWith('fea') || lower.startsWith('feb')) return true;
  if (lower.startsWith('fc') || lower.startsWith('fd')) return true;
  if (lower.startsWith('fec') || lower.startsWith('fed') || lower.startsWith('fee') || lower.startsWith('fef')) return true;
  if (lower.startsWith('::ffff:')) {
    const mapped = lower.slice(7);
    const parts = mapped.split('.').map(Number);
    if (parts.length === 4 && parts.every((p) => p >= 0 && p <= 255)) {
      return isPrivateIPv4(mapped);
    }
  }
  return false;
}
