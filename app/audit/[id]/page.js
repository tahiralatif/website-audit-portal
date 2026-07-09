import Link from 'next/link';
import AuditView from './audit-view';

export default async function AuditPage({ params }) {
  const { id } = await params;
  let audit = null;

  try {
    const { getAudit, getUserByToken } = await import('@/lib/db');
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;

    audit = getAudit(parseInt(id, 10));

    if (audit && token) {
      const user = getUserByToken(token);
      if (user && audit.user_id && audit.user_id !== user.id) {
        audit = null;
      }
    }
  } catch (e) {
    // DB not available
  }

  if (!audit) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0f172a, #1e293b)',
        color: '#f8fafc',
        flexDirection: 'column',
        gap: '1rem',
        padding: '2rem',
      }}>
        <div style={{
          background: 'rgba(30,41,59,0.8)',
          borderRadius: '16px',
          padding: '3rem',
          textAlign: 'center',
          border: '1px solid rgba(100,116,139,0.3)',
        }}>
          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
          }}>
            This audit does not exist or has been removed.
          </p>
          <Link href="/" style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: '#06b6d4',
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'color 0.25s'
          }}>← Back to Home</Link>
        </div>
      </div>
    );
  }

  return <AuditView audit={audit} />;
}
