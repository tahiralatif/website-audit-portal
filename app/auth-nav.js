'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from './auth-nav.module.css';

export default function AuthNav({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((data) => setUser(data.user))
      .catch(() => {});
  }, []);

  const handleSignOut = async () => {
    await fetch('/api/auth/signout', { method: 'POST' });
    window.location.href = '/';
  };

  return (
    <nav className={styles.nav} role="navigation" aria-label="Main navigation">
      <Link href="/" className={styles.logo} aria-label="Audit Portal - Home">Audit Portal</Link>
      <div className={styles.links}>
        <a href="/history" className={styles.link} aria-label="View audit history">History</a>
        {user ? (
          <>
            <span className={styles.userName}>Hi, {user.name}</span>
            <button onClick={handleSignOut} className={styles.signOutBtn}>Sign Out</button>
          </>
        ) : (
          <a href="/signin" className={styles.signInBtn}>Sign In</a>
        )}
      </div>
    </nav>
  );
}
