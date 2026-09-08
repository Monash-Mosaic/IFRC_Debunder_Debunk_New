import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { hasLocale } from 'next-intl';
import { Geist, Geist_Mono } from 'next/font/google';
import type { Metadata } from 'next';

import CloudflareWebPerformance from '@/components/cloudflare-web-performance';
import GoogleAnalytics from '@/components/google-analytics';
import Header from '@/components/header';
import PointsCredibilityBar from '@/components/points-credibility-bar';
import Navigation from '@/components/navigation-bar';
import { routing } from '@/i18n/routing';
import { getDirection } from '@/i18n/utils';

import '../globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    return {};
  }

  // Enable static rendering
  setRequestLocale(locale);

  const t = await getTranslations('metadata');

  return {
    title: t('title'),
    description: t('description'),
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Ensure that the incoming `locale` is valid
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  // Enable static rendering
  setRequestLocale(locale);

  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  
  // Determine direction for RTL support
  const direction = getDirection(locale);

  return (
    <html lang={locale} dir={direction}>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased ${direction}`}>
        <NextIntlClientProvider messages={messages}>
          <Navigation />
          <Header />
          <PointsCredibilityBar />
          <main id="root" className="min-h-screen bg-white pt-24">
            {children}
          </main>
        </NextIntlClientProvider>
        <GoogleAnalytics />
        <CloudflareWebPerformance />
      </body>
    </html>
  );
}
