# 🔍 Website Audit Portal

A comprehensive website auditing tool that analyzes any URL for **SEO**, **Performance**, **Security**, and **Accessibility** issues — powered by Hermes Agent.

**🌐 Live Site:** [https://server.14.jugaar.ai](https://server.14.jugaar.ai)

---

## ✨ Features

- **SEO Analysis** — Meta tags, headings, sitemap, robots.txt, Open Graph, structured data
- **Performance Scoring** — Lighthouse-powered metrics (FCP, LCP, CLS, TTI)
- **Security Audit** — TLS certificates, security headers, vulnerability detection
- **Accessibility Check** — WCAG compliance, ARIA labels, screen reader support
- **Real-time Progress** — Live status updates as each audit tool runs
- **Visual Reports** — Score rings, category breakdowns, and actionable suggestions
- **Audit History** — Track and revisit all past audits
- **Rate Limiting** — 5 audits per 10 minutes per user
- **SSRF Protection** — Blocks private/internal IP addresses

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Runtime | React 19 |
| Database | SQLite (better-sqlite3) |
| Browser Automation | Puppeteer 25 |
| Performance | Lighthouse 13 |
| Accessibility | axe-core 4.12 |
| HTML Parsing | Cheerio |
| Auth | bcryptjs + HTTP-only tokens |
| Deployment | PM2 on VPS |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
git clone https://github.com/tahiralatif/website-audit-with-hermes.git
cd website-audit-with-hermes
npm install
```

### Seed Demo User

```bash
node scripts/seed-demo-user.js
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
pm2 start ecosystem.config.cjs
```

## 🔐 Demo Credentials

| Field | Value |
|-------|-------|
| Email | `demo@auditportal.com` |
| Password | `Demo@2026` |

## 📁 Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/          # Sign in, sign up, sign out, me
│   │   └── audit/         # Create & fetch audits
│   ├── audit/[id]/        # Audit detail page (live polling)
│   ├── history/           # Audit history list
│   ├── signin/            # Sign in page
│   ├── signup/            # Sign up page (disabled in demo)
│   ├── layout.js          # Root layout with auth
│   ├── page.js            # Home page (audit form)
│   └── auth-nav.js        # Navigation bar
├── lib/
│   ├── db.js              # SQLite database (users + audits)
│   ├── orchestrator.js    # Audit tool coordinator
│   ├── browser.js         # Puppeteer browser manager
│   ├── reporter.js        # Score calculation & report generation
│   ├── connectivity.js    # Pre-flight connectivity check
│   ├── logger.js          # Audit logging (success/error/rate-limit)
│   ├── rate-limiter.js    # In-memory rate limiter
│   └── ssrf.js            # SSRF protection (private IP blocking)
├── scripts/
│   └── seed-demo-user.js  # Database seed script
└── ecosystem.config.cjs   # PM2 deployment config
```

## 🔒 Security

- **SSRF Protection** — DNS resolution check blocks private/internal IPs
- **Rate Limiting** — 5 audits per 10 minutes per authenticated user
- **HTTP-only Cookies** — Tokens are not accessible via JavaScript
- **Authentication Required** — All audit endpoints require valid token
- **Input Validation** — URL format validation before processing

## 📊 Audit Tools

| Tool | What It Checks |
|------|---------------|
| **SEO** | Meta tags, title, description, headings, images, links, canonical, Open Graph |
| **Performance** | Lighthouse scores, resource sizes, render-blocking resources, image optimization |
| **Security** | HTTP headers (CSP, HSTS, X-Frame-Options), mixed content, TLS info |
| **Accessibility** | WCAG violations, missing alt text, form labels, color contrast, ARIA roles |

## 🏗 Architecture

```
User Request → Next.js API → Auth Check → Rate Limit → SSRF Check → Spawn Worker
                                                                          ↓
                                                              SQLite (status: running)
                                                                          ↓
                                              Connectivity Check → Tool Execution → Report Generation
                                                                          ↓
                                                              SQLite (status: completed)
                                                                          ↓
                                                            Client polls → Display Results
```

## 📝 License

MIT

## 🙏 Built With

- [Next.js](https://nextjs.org/) — React framework
- [Puppeteer](https://pptr.dev/) — Browser automation
- [Lighthouse](https://github.com/GoogleChrome/lighthouse) — Performance auditing
- [axe-core](https://github.com/dequelabs/axe-core) — Accessibility testing
- [Hermes Agent](https://github.com/NousResearch/hermes-agent) — AI-powered development
