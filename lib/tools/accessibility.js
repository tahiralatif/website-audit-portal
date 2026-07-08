export default async function runAccessibility(url, browser) {
  const result = {
    score: null,
    violations: [],
    passes: 0,
    incomplete: 0,
    tags: [],
  };

  const page = await browser.newPage();
  try {
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

    const AxeBuilder = (await import('@axe-core/puppeteer')).default;
    const axeResults = await new AxeBuilder(page)
      .withTags(['wcag2a', 'wcag2aa', 'best-practice'])
      .analyze();

    result.passes = axeResults.passes.length;
    result.incomplete = axeResults.incomplete.length;
    result.violations = axeResults.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      tags: v.tags,
      nodes: v.nodes.length,
    }));

    const impactWeights = { critical: 4, serious: 3, moderate: 2, minor: 1 };
    let totalWeight = 0;
    let violationWeight = 0;

    axeResults.violations.forEach((v) => {
      const weight = impactWeights[v.impact] || 1;
      totalWeight += weight * v.nodes.length;
      violationWeight += weight * v.nodes.length;
    });

    axeResults.passes.forEach((p) => {
      const weight = 2;
      totalWeight += weight;
    });

    result.score =
      totalWeight > 0
        ? Math.round(((totalWeight - violationWeight) / totalWeight) * 100)
        : 100;

    result.tags = [...new Set(axeResults.violations.flatMap((v) => v.tags))];
  } finally {
    await page.close();
  }

  return result;
}
