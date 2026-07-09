/**
 * Quick connectivity check before running full audit.
 * Returns { reachable: true/false, error?, statusCode? }
 * Fails fast (~5s max) so we don't waste time on dead sites.
 */
export default async function checkConnectivity(url) {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    const response = await fetch(url, {
      method: 'HEAD',
      headers: { 'User-Agent': 'WebsiteAuditBot/1.0 (connectivity-check)' },
      signal: controller.signal,
      redirect: 'follow',
    });

    clearTimeout(timeout);

    return {
      reachable: true,
      statusCode: response.status,
    };
  } catch (err) {
    let message = err.message;
    const causeCode = err.cause?.code;
    const causeMsg = typeof err.cause === 'string'
      ? err.cause
      : err.cause?.message || '';

    if (err.name === 'AbortError') {
      message = 'Connection timed out after 8 seconds. The site may be too slow or unreachable.';
    } else if (causeCode === 'ECONNREFUSED') {
      message = 'Connection refused — the server is not accepting connections on this port.';
    } else if (causeCode === 'ECONNRESET') {
      message = 'Connection reset — the server closed the connection unexpectedly.';
    } else if (causeCode === 'ENOTFOUND' || causeCode === 'ENODATA') {
      message = 'Domain not found — DNS lookup failed. The domain may not exist or has no DNS records.';
    } else if (causeCode === 'ETIMEDOUT' || causeCode === 'UND_ERR_CONNECT_TIMEOUT') {
      message = 'Connection timed out — the server took too long to respond.';
    } else if (
      causeCode === 'ERR_TLS_CERT_ALTNAME_INVALID' ||
      causeCode === 'ERR_TLS_CERT_NOT_YET_VALID' ||
      causeCode === 'ERR_TLS_CERT_HAS_EXPIRED' ||
      causeCode?.startsWith('ERR_TLS_') ||
      (causeMsg + message).match(/certificate|SSL|TLS/i)
    ) {
      const detail = causeMsg || message;
      message = `SSL/TLS error: ${detail}`;
    } else if (causeCode?.startsWith('UND_ERR_')) {
      message = `Network error: ${causeMsg || causeCode}`;
    }

    return {
      reachable: false,
      error: message,
    };
  }
}
