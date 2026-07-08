import styles from './page.module.css';

export default async function HistoryPage() {
  let audits = [];
  try {
    const { listAudits } = await import('@/lib/db');
    audits = listAudits(50);
  } catch (e) {
    // DB not available in this context
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Audit History</h1>
      {audits.length === 0 ? (
        <p className={styles.empty}>No audits yet. Run your first audit from the home page.</p>
      ) : (
        <div className={styles.list}>
          {audits.map((audit) => (
            <a
              key={audit.id}
              href={`/audit/${audit.id}`}
              className={styles.card}
            >
              <div className={styles.cardHeader}>
                <span className={styles.url}>{audit.url}</span>
                <span className={`${styles.badge} ${styles[audit.status]}`}>
                  {audit.status}
                </span>
              </div>
              {audit.results && (
                <div className={styles.scoreRow}>
                  <span className={styles.score}>
                    Score: {audit.results.overallScore || 'N/A'}
                  </span>
                  <span className={styles.grade}>
                    Grade: {audit.results.overallGrade || '-'}
                  </span>
                </div>
              )}
              <div className={styles.date}>
                {new Date(audit.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
