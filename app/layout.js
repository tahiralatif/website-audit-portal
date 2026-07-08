import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { cookies } from 'next/headers';
import AuthNav from './auth-nav';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] });

export const metadata = {
  title: 'Website Audit Portal',
  description: 'Analyze your website for SEO, Performance, Security, and Accessibility',
  metadataBase: new URL('https://server.14.jugaar.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'Website Audit Portal',
    description: 'Analyze your website for SEO, Performance, Security, and Accessibility issues. Get scored, graded, and actionable suggestions.',
    url: 'https://server.14.jugaar.ai',
    siteName: 'Website Audit Portal',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Website Audit Portal',
    description: 'Analyze your website for SEO, Performance, Security, and Accessibility issues. Get scored, graded, and actionable suggestions.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Website Audit Portal",
              "url": "https://server.14.jugaar.ai",
              "description": "Analyze your website for SEO, Performance, Security, and Accessibility issues. Get scored, graded, and actionable suggestions.",
              "applicationCategory": "DeveloperApplication",
              "operatingSystem": "Web",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "featureList": [
                "SEO Analysis",
                "Performance Scoring",
                "Security Audit",
                "Accessibility Check"
              ]
            })
          }}
        />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <AuthNav user={user} />
        <main id="main-content">{children}</main>
      </body>
    </html>
  );
}
