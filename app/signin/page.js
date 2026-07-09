'use client';

import { useState } from 'react';
import styles from './page.module.css';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Sign in failed');
        setLoading(false);
        return;
      }

      window.location.href = '/';
    } catch (err) {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.heroOrb1}></div>
      <div className={styles.heroOrb2}></div>
      <div className={styles.authCard}>
        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Access your audit dashboard</p>

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.field}>
            <span className={styles.label}>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className={styles.input}
              required
              aria-label="Email address"
            />
          </label>

          <label className={styles.field}>
            <span className={styles.label}>Password</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={styles.input}
              required
              aria-label="Password"
            />
          </label>

          {error && <div className={styles.error}>{error}</div>}

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className={styles.footer}>
          Don't have an account? <a href="/signup" className={styles.link}>Sign Up</a>
        </p>
      </div>
    </div>
  );
}
