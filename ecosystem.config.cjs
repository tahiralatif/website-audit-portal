module.exports = {
  apps: [
    {
      name: 'website-audit',
      script: 'npx',
      args: 'next start -p 3000',
      cwd: '/root/website-audit-portal',
      env: {
        NODE_ENV: 'production',
      },
    },
  ],
};
