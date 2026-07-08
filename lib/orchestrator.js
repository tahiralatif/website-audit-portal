import { acquire, release } from './browser.js';
import runSeo from './tools/seo.js';
import runPerformance from './tools/performance.js';
import runSecurity from './tools/security.js';
import runAccessibility from './tools/accessibility.js';

const TIMEOUTS = {
  seo: 20000,
  security: 15000,
  performance: 90000,
  accessibility: 45000,
};

export default async function runAudit(url, onProgress) {
  const results = {};
  const browser = await acquire();

  try {
    onProgress?.('seo');
    results.seo = await withTimeout(runSeo(url), TIMEOUTS.seo, 'SEO');

    onProgress?.('security');
    const page = await browser.newPage();
    try {
      results.security = await withTimeout(
        runSecurity(url, page),
        TIMEOUTS.security,
        'Security'
      );
    } finally {
      await page.close();
    }

    onProgress?.('performance');
    results.performance = await withTimeout(
      runPerformance(url, browser),
      TIMEOUTS.performance,
      'Performance'
    );

    onProgress?.('accessibility');
    results.accessibility = await withTimeout(
      runAccessibility(url, browser),
      TIMEOUTS.accessibility,
      'Accessibility'
    );
  } finally {
    await release();
  }

  return results;
}

function withTimeout(promise, ms, label) {
  return Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms)
    ),
  ]);
}
