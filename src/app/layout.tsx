import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ConditionalLayout from '@/components/ConditionalLayout';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Tusome - Learn, Grow, and Excel",
    template: "%s | Tusome"
  },
  description: "Empowering Kenyan students with world-class educational content, personalized learning paths, and culturally relevant resources to achieve academic excellence. CBC curriculum aligned.",
  keywords: [
    "Tusome",
    "Kenya education",
    "CBC curriculum",
    "online learning",
    "Kenyan students",
    "e-learning platform",
    "academic excellence",
    "competency-based curriculum",
    "KCSE preparation",
    "Junior Secondary",
    "Senior Secondary",
    "Grade 4-12",
    "Kiswahili",
    "Mathematics",
    "Science",
    "English"
  ],
  authors: [{ name: "Tusome Education Platform" }],
  creator: "Tusome",
  publisher: "Tusome",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_KE",
    url: "https://tusome.co.ke",
    title: "Tusome - Learn, Grow, and Excel",
    description: "Empowering Kenyan students with world-class educational content, personalized learning paths, and culturally relevant resources to achieve academic excellence.",
    siteName: "Tusome",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Tusome - Kenyan Educational Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tusome - Learn, Grow, and Excel",
    description: "Empowering Kenyan students with world-class educational content and CBC curriculum aligned resources.",
    images: ["/twitter-image.jpg"],
    creator: "@TusomeKenya",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  category: "education",
  classification: "Educational Platform",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://tusome.co.ke"),
  alternates: {
    canonical: "/",
    languages: {
      "en-KE": "/en",
      "sw-KE": "/sw",
    },
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "mask-icon",
        url: "/safari-pinned-tab.svg",
        color: "#006600",
      },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tusome",
    startupImage: [
      {
        url: "/apple-splash-2048-2732.jpg",
        media: "(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)",
      },
    ],
  },
  other: {
    "msapplication-TileColor": "#006600",
    "theme-color": "#006600",
    "mobile-web-app-capable": "yes",
    "application-name": "Tusome",
    "msapplication-tooltip": "Tusome - Kenyan Educational Platform",
    "msapplication-starturl": "/",
    "msapplication-config": "/browserconfig.xml",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-KE" dir="ltr">
      <head>
        {/* Preconnect to external domains for performance */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />

        {/* Additional meta tags for better SEO */}
        <meta name="geo.region" content="KE" />
        <meta name="geo.country" content="Kenya" />
        <meta name="geo.placename" content="Nairobi" />
        <meta name="ICBM" content="-1.286389, 36.817223" />

        {/* PWA meta tags */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

        {/* Structured Data for Education Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "Tusome",
              "alternateName": "Tusome Educational Platform",
              "url": "https://tusome.co.ke",
              "logo": "https://tusome.co.ke/logo.png",
              "description": "Empowering Kenyan students with world-class educational content, personalized learning paths, and culturally relevant resources to achieve academic excellence.",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "Nairobi",
                "addressCountry": "KE"
              },
              "contactPoint": {
                "@type": "ContactPoint",
                "telephone": "+254-700-123-456",
                "contactType": "customer service",
                "areaServed": "KE",
                "availableLanguage": ["English", "Kiswahili"]
              },
              "sameAs": [
                "https://twitter.com/TusomeKenya",
                "https://facebook.com/TusomeKenya",
                "https://instagram.com/TusomeKenya",
                "https://linkedin.com/company/tusome-kenya"
              ],
              "offers": {
                "@type": "Offer",
                "category": "Educational Services",
                "description": "CBC aligned courses for Kenyan students"
              }
            })
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col min-h-screen bg-white selection:bg-green-100 selection:text-green-900`}
      >
        {/* Skip to main content for accessibility */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 bg-green-600 text-white p-2 z-50"
        >
          Skip to main content
        </a>

        <ConditionalLayout>
          {children}
        </ConditionalLayout>

        {/* Analytics and tracking scripts can be added here */}
        {process.env.NODE_ENV === 'production' && (
          <>
            {/* Google Analytics */}
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_ID}`}
            />
            <script
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${process.env.NEXT_PUBLIC_GA_ID}');
                `,
              }}
            />
          </>
        )}
      </body>
    </html>
  );
}