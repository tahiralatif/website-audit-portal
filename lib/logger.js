import fs from 'fs';
import path from 'path';

const LOG_DIR = path.join(process.cwd(), 'logs');

function ensureDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function writeJson(filename, obj) {
  ensureDir();
  const line = JSON.stringify({
    timestamp: new Date().toISOString(),
    ...obj,
  }) + '\n';
  fs.appendFileSync(path.join(LOG_DIR, filename), line);
}

export function logAuditSuccess(auditId, url, durationMs) {
  writeJson(`audit-success-${today()}.log`, {
    level: 'info',
    message: 'Audit completed',
    auditId,
    url,
    durationMs,
  });
}

export function logAuditError(auditId, url, error, extra = {}) {
  writeJson(`audit-error-${today()}.log`, {
    level: 'error',
    message: 'Audit failed',
    auditId,
    url,
    error,
    ...extra,
  });
}

export function logRateLimit(key, ip) {
  writeJson(`rate-limits-${today()}.log`, {
    level: 'warn',
    message: 'Rate limit exceeded',
    key,
    ip,
  });
}
