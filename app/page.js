'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';

export default function Home() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [recentAudits, setRecentAudits] = useState([]);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => {
        setUser(data.user);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (user) {
      fetch('/api/audit?limit=5')
        .then((r) => r.json())
        .then((data) => {
          if (Array.isArray(data)) setRecentAudits(data);
        })
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!url) return;

    let fullUrl = url;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: fullUrl }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push(`/audit/${data.auditId}`);
      } else {
        alert(data.error || 'Failed to start audit');
      }
    } catch (err) {
      alert('Network error');
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.heroOrb1}></div>
        <div className={styles.heroOrb2}></div>
        <div className={styles.authPrompt}>
          <h1 className={styles.title}>Website Audit Portal</h1>
          <p className={styles.subtitle}>
            Analyze your website for SEO, Performance, Security, and Accessibility issues
          </p>
          <div className={styles.authButtons}>
            <a href="/signin" className={styles.btnPrimary}>Sign In</a>
            <a href="/signup" className={styles.btnSecondary}>Sign Up</a>
          </div>
        </div>
        <div className={styles.features}>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔍</span>
            <h3>SEO Analysis</h3>
            <p>Check meta tags, headings, sitemap, robots.txt, and more</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>⚡</span>
            <h3>Performance</h3>
            <p>Lighthouse scores, FCP, LCP, CLS, and load times</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>🔒</span>
            <h3>Security</h3>
            <p>TLS certificates, security headers, and vulnerability checks</p>
          </div>
          <div className={styles.featureCard}>
            <span className={styles.featureIcon}>♿</span>
            <h3>Accessibility</h3>
            <p>WCAG compliance, ARIA labels, and screen reader support</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.heroOrb1}></div>
      <div className={styles.heroOrb2}></div>
      <div className={styles.mainContent}>
        <h1 className={styles.title}>Audit Your Website</h1>
        <p className={styles.subtitle}>
          Enter a URL to run a comprehensive audit
        </p>
        <form onSubmit={handleSubmit} className={styles.auditForm}>
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            className={styles.urlInput}
            disabled={submitting}
          />
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={submitting || !url}
          >
            {submitting ? 'Starting...' : 'Run Audit'}
          </button>
        </form>
        {recentAudits.length > 0 && (
          <div className={styles.recentSection}>
            <h2>Recent Audits</h2>
            <div className={styles.recentList}>
              {recentAudits.map((audit) => (
                <a
                  key={audit.id}
                  href={`/audit/${audit.id}`}
                  className={styles.recentItem}
                >
                  <span className={styles.recentUrl}>{audit.url}</span>
                  <span className={`${styles.statusBadge} ${styles[audit.status]}`}>
                    {audit.status}
                  </span>
                </a>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
