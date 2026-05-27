import type { Metadata } from 'next';
import { DM_Sans, Noto_Sans_SC, Italianno } from 'next/font/google';
import './globals.css';
import { I18nProvider } from '@/lib/i18n-context';
import { ThemeProvider } from '@/lib/theme-context';
import { getLanguages, getDictionaries, getSiteSettings } from '@/lib/directus';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
});

const notoSansSC = Noto_Sans_SC({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-noto-sc',
  display: 'swap',
});

const italianno = Italianno({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-italianno',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'TABERNAM',
  description: 'Tabernam — Global activity presence',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [languages, dictionaries, settings] = await Promise.all([
    getLanguages(),
    getDictionaries(),
    getSiteSettings(),
  ]);

  const themeVars = {
    '--color-bg': settings.colorBg,
    '--color-text': settings.colorText,
    '--color-muted': settings.colorMuted,
    '--color-surface': settings.colorSurface,
    '--color-button': settings.colorButton,
    '--color-button-text': settings.colorButtonText,
    '--color-button-hover': settings.colorButtonHover,
    '--color-header': settings.colorHeader,
    '--color-border': settings.colorBorder,
    '--color-footer-bg': settings.colorFooterBg,
    '--max-width': settings.maxWidth,
    '--side-padding': settings.sidePadding,
    '--header-height': settings.headerHeight,
    ...(settings.fontFamily ? { '--font-override': settings.fontFamily } : {}),
  } as React.CSSProperties;

  return (
    <html lang="en" className={`${dmSans.variable} ${notoSansSC.variable} ${italianno.variable}`} style={themeVars}>
      <body className="bg-bg text-text leading-snug">
        <I18nProvider languages={languages} dictionaries={dictionaries}>
          <ThemeProvider settings={settings}>
            <Header />
            {children}
            <Footer />
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
