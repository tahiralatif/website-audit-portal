let browser = null;
let refCount = 0;

export async function acquire() {
  if (!browser || !browser.connected) {
    const puppeteer = await import('puppeteer');
    browser = await puppeteer.default.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
      ],
    });
    refCount = 0;
  }
  refCount++;
  return browser;
}

export async function release() {
  refCount--;
  if (refCount <= 0 && browser) {
    try {
      await browser.close();
    } catch (e) {
      // ignore
    }
    browser = null;
    refCount = 0;
  }
}

export function getBrowser() {
  return browser;
}
