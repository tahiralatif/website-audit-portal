import tls from 'tls';

export default async function runSecurity(url) {
  const result = {
    tls: null,
    headers: {},
  };

  // TLS certificate check
  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol === 'https:') {
      const hostname = parsedUrl.hostname;
      const port = parsedUrl.port || 443;

      result.tls = await new Promise((resolve) => {
        const socket = tls.connect({ host: hostname, port: Number(port), servername: hostname, rejectUnauthorized: false }, () => {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.subject) {
            resolve({ valid: false, error: 'No certificate presented' });
            return;
          }

          const now = new Date();
          const validFrom = new Date(cert.valid_from);
          const validTo = new Date(cert.valid_to);
          const expired = now > validTo || now < validFrom;
          const issuer = cert.issuer?.O || cert.issuer?.CN || 'Unknown';
          const daysLeft = Math.floor((validTo - now) / (1000 * 60 * 60 * 24));

          resolve({
            valid: !expired && socket.authorized,
            expired,
            subject: cert.subject?.CN,
            issuer,
            validFrom: cert.valid_from,
            validTo: cert.valid_to,
            daysLeft,
            protocol: socket.getProtocol(),
          });
          socket.destroy();
        });

        socket.on('error', (err) => {
          resolve({ valid: false, error: err.message });
        });

        setTimeout(() => {
          socket.destroy();
          resolve({ valid: false, error: 'TLS handshake timeout' });
        }, 5000);
      });
    } else {
      result.tls = { valid: false, error: 'Not HTTPS' };
    }
  } catch (err) {
    result.tls = { valid: false, error: err.message };
  }

  // Security headers check
  try {
    const response = await fetch(url, {
      method: 'HEAD",
      redirect: 'follow",
      signal: AbortSignal.timeout(5000),
    });

    const headers = {};
    const checks = {
      hsts: response.headers.get('strict-transport-security'),
      csp: response.headers.get('content-security-policy'),
      xFrameOptions: response.headers.get('x-frame-options'),
      xContentTypeOptions: response.headers.get('x-content-type-options'),
      xXssProtection: response.headers.get('x-xss-protection'),
      referrerPolicy: response.headers.get('referrer-policy'),
      permissionsPolicy: response.headers.get('permissions-policy'),
    };

    for (const [key, value] of Object.entries(checks)) {
      headers[key] = { present: !!value, value: value || null };
    }

    result.headers = headers;
  } catch (err) {
    result.headersError = err.message;
  }

  return result;
}
