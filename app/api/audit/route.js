import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { getUserByToken, createAudit } = await import('@/lib/db');
    const { spawn } = await import('child_process');

    const token = request.cookies.get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const user = getUserByToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    new URL(url);

    const audit = createAudit(url, user.id);

    // Spawn worker as detached child process
    const workerScript = `
      const { getAudit, updateAudit } = require('/root/website-audit-portal/lib/db.js');
      const runAudit = require('/root/website-audit-portal/lib/orchestrator.js').default;
      const { generateReport } = require('/root/website-audit-portal/lib/reporter.js');
      const { logAuditError, logAuditSuccess } = require('/root/website-audit-portal/lib/logger.js');
      const checkConnectivity = require('/root/website-audit-portal/lib/connectivity.js').default;

      const auditId = ${audit.id};
      const TIMEOUT = 5 * 60 * 1000;

      process.on('uncaughtException', (err) => {
        console.error('Uncaught exception:', err);
        updateAudit(auditId, { status: 'error', error: err.message });
        process.exit(1);
      });

      process.on('unhandledRejection', (err) => {
        console.error('Unhandled rejection:', err);
        updateAudit(auditId, { status: 'error', error: String(err) });
        process.exit(1);
      });

      const timer = setTimeout(() => {
        updateAudit(auditId, { status: 'error', error: 'Audit timed out after 5 minutes' });
        process.exit(1);
      }, TIMEOUT);

      async function main() {
        const audit = getAudit(auditId);
        if (!audit) {
          console.error('Audit not found:', auditId);
          process.exit(1);
        }

        updateAudit(auditId, { status: 'running' });

        // Pre-flight connectivity check — fail fast on unreachable sites
        const connectivity = await checkConnectivity(audit.url);
        if (!connectivity.reachable) {
          const userMessage = connectivity.error || 'The website could not be reached.';
          logAuditError(auditId, audit.url, userMessage, { phase: 'connectivity-check' });
          updateAudit(auditId, {
            status: 'error',
            error: userMessage,
          });
          clearTimeout(timer);
          process.exit(0);
        }

        try {
          const results = await runAudit(audit.url, (tool) => {
            updateAudit(auditId, { current_tool: tool });
          });

          const report = generateReport(results);

          updateAudit(auditId, {
            status: 'completed',
            current_tool: null,
            results: report,
          });
        } catch (err) {
          updateAudit(auditId, {
            status: 'error',
            error: err.message,
          });
        }

        clearTimeout(timer);
        process.exit(0);
      }

      main();
    `;

    const child = spawn('node', ['-e', workerScript], {
      detached: true,
      stdio: 'ignore',
    });
    child.unref();

    return NextResponse.json({ auditId: audit.id, url: audit.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
