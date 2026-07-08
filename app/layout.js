import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cookies } from 'next/headers';
import AuthNav from './auth-nav';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Website Audit Portal',
  description: 'Analyze your website for SEO, Performance, Security, and Accessibility',
};

export default async function RootLayout({ children }) {
  let user = null;
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    if (token) {
      const { getUserByToken } = await import('@/lib/db');
      const dbUser = getUserByToken(token);
      if (dbUser) {
        user = { id: dbUser.id, name: dbUser.name, email: dbUser.email };
      }
    }
  } catch (e) {
    // ignore - db might not be available during build
  }

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <AuthNav user={user} />
        {children}
      </body>
    </html>
  );
}
