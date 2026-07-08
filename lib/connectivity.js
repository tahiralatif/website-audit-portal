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

    if (err.name === 'AbortError') {
      message = 'Connection timed out after 8 seconds. The site may be too slow or unreachable.';
    } else if (err.cause?.code === 'ECONNREFUSED') {
      message = 'Connection refused — the server is not accepting connections on this port.';
    } else if (err.cause?.code === 'ECONNRESET') {
      message = 'Connection reset — the server closed the connection unexpectedly.';
    } else if (err.cause?.code === 'ENOTFOUND') {
      message = 'Domain not found — DNS lookup failed.';
    } else if (err.cause?.code === 'ETIMEDOUT') {
      message = 'Connection timed out — the server took too long to respond.';
    } else if (message.includes('certificate') || message.includes('SSL') || message.includes('TLS')) {
      message = `SSL/TLS error: ${message}`;
    }

    return {
      reachable: false,
      error: message,
    };
  }
}
