import { calculateGrades } from './grade';

export function generateReport(toolResults) {
  const report = {
    seo: toolResults.seo || {},
    performance: toolResults.performance || {},
    security: toolResults.security || {},
    accessibility: toolResults.accessibility || {},
    categories: {},
    overallScore: 0,
    overallGrade: 'F',
  };

  // Category mappings
  const categoryMap = {
    seo: { name: 'SEO', tools: ['seo'], weight: 1 },
    performance: { name: 'Performance', tools: ['performance'], weight: 1 },
    security: { name: 'Security', tools: ['security'], weight: 1 },
    accessibility: { name: 'Accessibility', tools: ['accessibility'], weight: 1 },
  };

  for (const [key, config] of Object.entries(categoryMap)) {
    const toolData = toolResults[config.tools[0]] || {};
    const items = [];

    // Generate items based on tool type
    switch (key) {
      case 'seo':
        if (toolData.title !== undefined) {
          items.push({ name: 'Title Tag', pass: !!toolData.title, message: toolData.title || 'Missing', recommendation: toolData.title ? null : 'Add a descriptive title tag' });
        }
        if (toolData.metaDescription !== undefined) {
          items.push({ name: 'Meta Description', pass: !!toolData.metaDescription, message: toolData.metaDescription || 'Missing', recommendation: toolData.metaDescription ? null : 'Add a meta description' });
        }
        if (toolData.viewport !== undefined) {
          items.push({ name: 'Viewport', pass: !!toolData.viewport, message: toolData.viewport ? 'Present' : 'Missing' });
        }
        if (toolData.canonical !== undefined) {
          items.push({ name: 'Canonical URL', pass: !!toolData.canonical, message: toolData.canonical || 'Missing' });
        }
        if (toolData.headings) {
          items.push({ name: 'Headings', pass: toolData.headings.h1Count > 0, message: `H1: ${toolData.headings.h1Count}, H2: ${toolData.headings.h2Count}` });
        }
        break;

      case 'performance':
        if (toolData.lighthouse) {
          const lh = toolData.lighthouse;
          items.push({ name: 'FCP', pass: lh.fcp < 1800, message: `${(lh.fcp/1000).toFixed(1)}s`, warn: lh.fcp >= 1800 });
          items.push({ name: 'LCP', pass: lh.lcp < 2500, message: `${(lh.lcp/1000).toFixed(1)}s`, warn: lh.lcp >= 2500 });
          items.push({ name: 'CLS', pass: lh.cls < 0.1, message: lh.cls.toFixed(3), warn: lh.cls >= 0.1 });
          items.push({ name: 'TTFB', pass: lh.ttfb < 800, message: `${(lh.ttfb/1000).toFixed(1)}s`, warn: lh.ttfb >= 800 });
          items.push({ name: 'Speed Index', pass: lh.speedIndex < 3400, message: `${(lh.speedIndex/1000).toFixed(1)}s`, warn: lh.speedIndex >= 3400 });
        }
        if (toolData.coreWebVitals) {
          for (const [metric, value] of Object.entries(toolData.coreWebVitals)) {
            items.push({ name: metric, pass: value.good, message: value.displayValue || `${value.value}` });
          }
        }
        break;

      case 'security':
        if (toolData.tls) {
          const tls = toolData.tls;
          items.push({ name: 'TLS Certificate', pass: tls.valid, message: tls.valid ? `Valid until ${tls.validTo} (${tls.daysLeft} days)` : (tls.error || 'Invalid'), recommendation: tls.valid ? null : 'Renew or fix the SSL certificate' });
          if (tls.protocol) {
            items.push({ name: 'TLS Protocol', pass: true, message: tls.protocol });
          }
        }
        if (toolData.headers) {
          const h = toolData.headers;
          items.push({ name: 'HSTS', pass: !!h.hsts?.present, message: h.hsts?.present ? h.hsts.value : 'Missing', recommendation: h.hsts?.present ? null : 'Add Strict-Transport-Security header' });
          items.push({ name: 'CSP', pass: !!h.csp?.present, message: h.csp?.present ? 'Present' : 'Missing', recommendation: h.csp?.present ? null : 'Add Content-Security-Policy header' });
          items.push({ name: 'X-Frame-Options', pass: !!h.xFrameOptions?.present, message: h.xFrameOptions?.value || 'Missing', recommendation: h.xFrameOptions?.present ? null : 'Add X-Frame-Options header' });
          items.push({ name: 'X-Content-Type-Options', pass: !!h.xContentTypeOptions?.present, message: h.xContentTypeOptions?.value || 'Missing', recommendation: h.xContentTypeOptions?.present ? null : 'Add X-Content-Type-Options header' });
          items.push({ name: 'Referrer-Policy', pass: !!h.referrerPolicy?.present, message: h.referrerPolicy?.value || 'Missing', recommendation: h.referrerPolicy?.present ? null : 'Add Referrer-Policy header' });
        }
        break;

      case 'accessibility':
        if (toolData.violations) {
          for (const violation of toolData.violations.slice(0, 10)) {
            items.push({ name: violation.id, pass: false, message: violation.description, recommendation: violation.help });
          }
        }
        if (toolData.passes !== undefined) {
          items.push({ name: 'Rules Passed', pass: toolData.passes > 0, message: `${toolData.passes} rules passed` });
        }
        if (toolData.incomplete !== undefined) {
          items.push({ name: 'Needs Review', pass: true, message: `${toolData.incomplete} items need manual review`, warn: toolData.incomplete > 0 });
        }
        break;
    }

    report.categories[key] = {
      name: config.name,
      items,
      ...calculateCategoryScore(items),
    };
  }

  // Calculate overall score
  const scores = Object.values(report.categories).map(c => c.score);
  report.overallScore = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  report.overallGrade = calculateGrades(report.overallScore);

  return report;
}

function calculateCategoryScore(items) {
  if (items.length === 0) return { score: 0, grade: 'F' };

  let score = 70; // base

  if (toolResults.title !== undefined) { if (toolResults.title) score += 5; }
  if (toolResults.metaDescription !== undefined) { if (toolResults.metaDescription) score += 5; }
  if (toolResults.viewport !== undefined) { if (toolResults.viewport) score += 5; }
  if (toolResults.canonical !== undefined) { if (toolResults.canonical) score += 5; }
  if (toolResults.tls) { if (toolResults.tls && !toolResults.tls.expired && !toolResults.tls.error) score += 5; }
  if (toolResults.headers) { if (toolResults.headers?.hsts) score += 5; }

  return Math.min(Math.max(score, 0), 100);
}