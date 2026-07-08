import { getAudit, updateAudit } from './db.js';
import runAudit from './orchestrator.js';
import { generateReport } from './reporter.js';

const auditId = parseInt(process.argv[2], 10);
const TIMEOUT = 5 * 60 * 1000; // 5 minutes

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
