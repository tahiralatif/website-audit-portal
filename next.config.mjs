/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3'],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer', 'lighthouse', '@axe-core/puppeteer');
    }
    return config;
  },
};

export default nextConfig;
