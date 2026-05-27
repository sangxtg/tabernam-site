'use client';

import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useTheme } from '@/lib/theme-context';
import ActivityLink from './activity/ActivityLink';

export default function Footer() {
  const { t } = useI18n();
  const { logoText } = useTheme();

  return (
    <footer className="mt-20 px-[var(--side-padding)] pt-20 pb-8 bg-footer-bg border-t border-border text-text max-sm:px-[var(--side-padding)] max-sm:pt-14 max-sm:pb-6">
      <div className="max-w-[var(--max-width)] mx-auto grid grid-cols-[1.6fr_1fr_1fr] gap-16 pb-14 max-sm:grid-cols-1 max-sm:gap-10 max-sm:pb-10">
        <div className="flex flex-col gap-4 max-w-[400px]">
          <Link href="/" className="inline-flex items-center" aria-label={logoText}>
            <span
              className="text-brand leading-none select-none text-[60px]"
              style={{ fontFamily: 'var(--font-italianno), cursive' }}
            >
              {logoText}
            </span>
          </Link>
          <p className="text-[15px] leading-relaxed text-muted">A consulting practice rooted in four decades of foreign trade. Based in Bratislava, working with partners across China and dozens of markets beyond.</p>
        </div>
        <nav className="footer-col" aria-label={t('aria.footerNav')}>
          <h4 className="text-[13px] font-semibold tracking-widest uppercase text-text mb-5">{t('footer.navigation')}</h4>
          <ul className="list-none flex flex-col gap-3">
            <li><Link href="/" className="text-base text-muted transition-colors duration-200 hover:text-text">{t('nav.home')}</Link></li>
            <li><Link href="/about" className="text-base text-muted transition-colors duration-200 hover:text-text">{t('nav.about')}</Link></li>
            <li><Link href="/contact" className="text-base text-muted transition-colors duration-200 hover:text-text">{t('nav.contact')}</Link></li>
            <li><ActivityLink className="text-base text-muted transition-colors duration-200 hover:text-text">{t('nav.activity')}</ActivityLink></li>
          </ul>
        </nav>
        <div className="footer-col">
          <h4 className="text-[13px] font-semibold tracking-widest uppercase text-text mb-5">{t('footer.contact')}</h4>
          <ul className="list-none flex flex-col gap-3">
            <li><a href="mailto:hello@tabernam.com" className="text-base text-muted transition-colors duration-200 hover:text-text">hello@tabernam.com</a></li>
            <li className="text-base text-muted">Bratislava, Slovakia</li>
          </ul>
        </div>
      </div>
      <div className="max-w-[var(--max-width)] mx-auto pt-6 border-t border-border text-sm text-muted">
        <p>{t('footer.copyright')}</p>
      </div>
    </footer>
  );
}
