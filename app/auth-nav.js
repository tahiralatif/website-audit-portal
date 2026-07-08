'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './auth-nav.module.css';

export default function AuthNav({ user: initialUser }) {
  const [user, setUser] = useState(initialUser || null);
  const router = useRouter();

  useEffect(() => {
    if (!initialUser) {
      fetch('/api/auth/me')
        .then((r) => r.json())
        .then((data) => setUser(data.user));
    }
  }, [initialUser]);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    setUser(null);
    router.push('/');
  };

  return (
    <nav className={styles.nav}>
      <a href="/" className={styles.logo}>Audit Portal</a>
      <div className={styles.links}>
        <a href="/history" className={styles.link}>History</a>
        {user ? (
          <div className={styles.userSection}>
            <span className={styles.userName}>{user.name}</span>
            <button onClick={handleSignOut} className={styles.signOutBtn}>
              Sign Out
            </button>
          </div>
        ) : (
          <div className={styles.authLinks}>
            <a href="/signin" className={styles.link}>Sign In</a>
          </div>
        )}
      </div>
    </nav>
  );
}
