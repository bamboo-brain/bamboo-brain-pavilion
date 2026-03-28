import type { Metadata } from 'next';
import { Manrope, Inter } from 'next/font/google';
import { ColorSchemeScript, MantineProvider, mantineHtmlProps, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';
import './globals.css';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  display: 'swap',
});

const theme = createTheme({
  fontFamily: 'var(--font-inter), Inter, sans-serif',
  headings: {
    fontFamily: 'var(--font-manrope), Manrope, sans-serif',
  },
  primaryColor: 'bamboo',
  colors: {
    bamboo: [
      '#f4faf3',
      '#e4f2e2',
      '#bcf0ae',
      '#a1d494',
      '#7bba75',
      '#5ca356',
      '#3b6934',
      '#2d5a27',
      '#23501e',
      '#154212',
    ],
  },
  defaultRadius: 'sm',
  other: {
    surface: '#f8faf7',
    surfaceContainerLow: '#f2f4f1',
    surfaceContainer: '#eceeeb',
    surfaceContainerHigh: '#e7e9e6',
    surfaceContainerHighest: '#e1e3e0',
    onSurface: '#191c1b',
    onSurfaceVariant: '#42493e',
    outline: '#72796e',
    outlineVariant: '#c2c9bb',
    primary: '#154212',
    primaryContainer: '#2d5a27',
    secondary: '#3f6744',
    tertiary: '#09396c',
  },
});

export const metadata: Metadata = {
  title: 'BambooBrain – The Scholar\'s Pavilion',
  description:
    'Master Mandarin through a curated, scholarly experience. Track your HSK progress, explore classical texts, and study with intention.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      {...mantineHtmlProps}
      className={`${manrope.variable} ${inter.variable}`}
    >
      <head>
        <ColorSchemeScript defaultColorScheme="light" />
      </head>
      <body suppressHydrationWarning={true}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
