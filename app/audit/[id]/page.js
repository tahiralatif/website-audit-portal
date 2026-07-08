import AuditView from './audit-view';

export default async function AuditPage({ params }) {
  const { id } = await params;
  
  let audit = null;
  try {
    const { getAudit } = await import('@/lib/db');
    audit = getAudit(parseInt(id, 10));
  } catch (e) {
    // DB not available
  }

  if (!audit) {
    return (
      <div style={{ padding: '2rem', color: '#f1f5f9', textAlign: 'center' }}>
        <h1>Audit Not Found</h1>
        <p>This audit does not exist or has been removed.</p>
        <a href="/" style={{ color: '#14b8a6' }}>← Back to Home</a>
      </div>
    );
  }

  return <AuditView audit={audit} />;
}
