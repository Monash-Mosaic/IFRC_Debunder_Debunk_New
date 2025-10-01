import './globals.css';

import { SpeedInsights } from '@vercel/speed-insights/next';
import { Press_Start_2P } from 'next/font/google';

export const metadata = {
  title: 'Debunk',
  description: 'Minimal Next.js starter'
};

const pressStart = Press_Start_2P({ weight: '400', subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={pressStart.className}>
        {children}
        <SpeedInsights/>
      </body>
    </html>
  );
}
