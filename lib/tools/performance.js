export default async function runPerformance(url, browser) {
  const result = {
    lighthouseScore: null,
    fcp: null,
    lcp: null,
    tbt: null,
    cls: null,
    si: null,
    loadTime: null,
  };

  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const loadTime = await page.evaluate(() => {
      const perf = performance.getEntriesByType('navigation')[0];
      return perf ? Math.round(perf.loadEventEnd - perf.startTime) : null;
    });
    result.loadTime = loadTime;

    let lighthouse;
    try {
      lighthouse = await import('lighthouse');
    } catch (e) {
      // lighthouse not available
    }

    if (lighthouse) {
      const pageUrl = page.url();
      const lhResult = await lighthouse.default(pageUrl, {
        port: new URL(browser.wsEndpoint()).port,
        output: 'json',
        logLevel: 'error',
        onlyCategories: ['performance'],
      });

      if (lhResult && lhResult.lhr) {
        result.lighthouseScore = Math.round(
          lhResult.lhr.categories.performance.score * 100
        );
        const audits = lhResult.lhr.audits;
        result.fcp = audits['first-contentful-paint']
          ? audits['first-contentful-paint'].numericValue
          : null;
        result.lcp = audits['largest-contentful-paint']
          ? audits['largest-contentful-paint'].numericValue
          : null;
        result.tbt = audits['total-blocking-time']
          ? audits['total-blocking-time'].numericValue
          : null;
        result.cls = audits['cumulative-layout-shift']
          ? audits['cumulative-layout-shift'].numericValue
          : null;
        result.si = audits['speed-index']
          ? audits['speed-index'].numericValue
          : null;
      }
    }

    if (!result.lighthouseScore) {
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('paint');
        return {
          fcp: perf.find((e) => e.name === 'first-contentful-paint')?.startTime || null,
        };
      });
      result.fcp = metrics.fcp;
    }
  } finally {
    await page.close();
  }

  return result;
}
