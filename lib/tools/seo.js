import * as cheerio from 'cheerio';

export default async function runSeo(url) {
  const result = {
    title: null,
    metaDescription: null,
    viewport: null,
    canonical: null,
    ogTags: {},
    twitterTags: {},
    headings: {},
    images: { total: 0, missingAlt: 0 },
    robotsTxt: null,
    sitemapXml: null,
  };

  try {
    const response = await fetch(url, {
      headers: { 'User-Agent': 'WebsiteAuditBot/1.0' },
      signal: AbortSignal.timeout(15000),
    });
    const html = await response.text();
    const $ = cheerio.load(html);

    result.title = $('title').first().text().trim() || null;
    result.metaDescription = $('meta[name="description"]').attr('content') || null;
    result.viewport = $('meta[name="viewport"]').attr('content') || null;
    result.canonical = $('link[rel="canonical"]').attr('href') || null;

    $('meta[property^="og:"]').each((_, el) => {
      const prop = $(el).attr('property');
      const content = $(el).attr('content');
      if (prop && content) result.ogTags[prop] = content;
    });

    $('meta[name^="twitter:"]').each((_, el) => {
      const name = $(el).attr('name');
      const content = $(el).attr('content');
      if (name && content) result.twitterTags[name] = content;
    });

    for (let i = 1; i <= 6; i++) {
      const count = $(`h${i}`).length;
      if (count > 0) result.headings[`h${i}`] = count;
    }

    const images = $('img');
    result.images.total = images.length;
    images.each((_, el) => {
      if (!$(el).attr('alt')) result.images.missingAlt++;
    });

    const origin = new URL(url).origin;

    try {
      const robotsRes = await fetch(`${origin}/robots.txt`, {
        signal: AbortSignal.timeout(5000),
      });
      if (robotsRes.ok) {
        result.robotsTxt = await robotsRes.text();
      }
    } catch (e) {
      result.robotsTxt = 'Not found';
    }

    try {
      const sitemapRes = await fetch(`${origin}/sitemap.xml`, {
        signal: AbortSignal.timeout(5000),
      });
      if (sitemapRes.ok) {
        const sitemapText = await sitemapRes.text();
        result.sitemapXml = sitemapText.includes('<urlset') ? 'Valid' : 'Invalid format';
      } else {
        result.sitemapXml = 'Not found';
      }
    } catch (e) {
      result.sitemapXml = 'Not found';
    }
  } catch (e) {
    throw new Error(`SEO analysis failed: ${e.message}`);
  }

  return result;
}
