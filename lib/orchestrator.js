import runSeo from './lib/tools/seo';
import runPerformance from './lib/tools/performance';
import runSecurity from './lib/tools/security';
import runAccessibility from './lib/tools/accessibility';
import puppeteer from 'puppeteer';

export default async function runAudit(url, onProgress) {
  let browser;

  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });

    const toolRunners = [
      { name: 'seo', fn: () => runSeo(url) },
      { name: 'security', fn: () => runSecurity(url) },
      { name: 'performance', fn: () => runPerformance(url, browser) },
      { name: 'accessibility', fn: () => runAccessibility(url, browser) },
    ];

    const results = {};

    for (const tool of toolRunners) {
      if (onProgress) onProgress(tool.name);
      try {
        results[tool.name] = await tool.fn();
      } catch (err) {
        results[tool.name] = { error: err.message };
      }
    }

    return results;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
