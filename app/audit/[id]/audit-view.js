'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './audit-view.module.css';

export default function AuditView({ audit: initialAudit }) {
  const [audit, setAudit] = useState(initialAudit);

  useEffect(() => {
    if (audit.status === 'pending' || audit.status === 'running') {
      const interval = setInterval(async () => {
        const res = await fetch(`/api/audit/${audit.id}`);
        const data = await res.json();
        setAudit(data);
        if (data.status === 'completed' || data.status === 'error') {
          clearInterval(interval);
        }
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [audit.id, audit.status]);

  if (audit.status === 'error') {
    return (
      <div className={styles.container}>
        <div className={styles.errorCard}>
          <h2>Audit Failed</h2>
          <p>{audit.error}</p>
          <Link href="/" className={styles.backLink}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  if (audit.status === 'pending' || audit.status === 'running') {
    return (
      <div className={styles.container}>
        <div className={styles.loadingCard}>
          <div className={styles.spinner}></div>
          <p className={styles.loadingText}>
            {audit.status === 'pending' ? 'Queued...' : `Running ${audit.current_tool || 'audit'}...`}
          </p>
        </div>
      </div>
    );
  }

  const results = audit.results || {};
  const showUnreachableBanner = audit.error && audit.error.includes('could not be reached');

  return (
    <div className={styles.container}>
      <div className={styles.heroOrb1}></div>
      <div className={styles.heroOrb2}></div>

      <Link href="/" className={styles.backLink}>← Back to Home</Link>
      <h1 className={styles.url}>{audit.url}</h1>

      {showUnreachableBanner && (
        <div className={styles.unreachableBanner}>
          ⚠️ The website could not be reached. Results may be incomplete.
        </div>
      )}

      <div className={styles.scoreOverview}>
        <div className={styles.overallScore}>
          <span className={styles.scoreValue}>{results.overallScore || 'N/A'}</span>
          <span className={styles.scoreLabel}>Overall Score</span>
        </div>
        <div className={styles.overallGrade}>
          <span className={styles.gradeValue}>{results.overallGrade || '-'}</span>
          <span className={styles.gradeLabel}>Grade</span>
        </div>
      </div>

      <div className={styles.categories}>
        {results.categories && Object.entries(results.categories).map(([key, cat]) => (
          <div key={key} className={styles.categoryCard}>
            <div className={styles.categoryHeader}>
              <h2>{cat.name || key}</h2>
              <div className={styles.categoryScore}>
                <span className={styles.catScoreValue}>{cat.score}</span>
                <span className={styles.catGrade}>{cat.grade}</span>
              </div>
            </div>
            {cat.items && cat.items.map((item, i) => (
              <div key={i} className={styles.checkItem}>
                <span className={styles.checkStatus}>{item.pass ? '✅' : item.warn ? '⚠️' : '❌'}</span>
                <div className={styles.checkContent}>
                  <span className={styles.checkName}>{item.name}</span>
                  {item.message && <p className={styles.checkMessage}>{item.message}</p>}
                  {item.recommendation && <p className={styles.checkRec}>💡 {item.recommendation}</p>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
