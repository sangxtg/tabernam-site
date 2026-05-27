'use client';

import { useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useI18n } from '@/lib/i18n-context';
import { useTheme } from '@/lib/theme-context';
import LangSwitcher from './LangSwitcher';
import ActivityLink from './activity/ActivityLink';

export default function Header() {
  const { t } = useI18n();
  const { logoText } = useTheme();
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  // Auto-hide header on scroll down
  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const header: HTMLElement = headerEl;
    const SHOW_AT_TOP = 80;
    const DELTA = 6;
    let lastY = window.scrollY;
    let raf = 0;

    function tick() {
      raf = 0;
      const y = window.scrollY;
      const dy = y - lastY;
      if (Math.abs(dy) < DELTA) return;
      if (y < SHOW_AT_TOP) {
        header.classList.remove('is-hidden');
      } else if (dy > 0) {
        header.classList.add('is-hidden');
      } else {
        header.classList.remove('is-hidden');
      }
      lastY = y;
    }

    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeNav = useCallback(() => {
    navRef.current?.classList.remove('is-open');
    toggleRef.current?.setAttribute('aria-expanded', 'false');
  }, []);

  const toggleNav = useCallback(() => {
    const nav = navRef.current;
    const toggle = toggleRef.current;
    if (!nav || !toggle) return;
    if (nav.classList.contains('is-open')) {
      nav.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
    } else {
      nav.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
    }
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeNav(); };
    const onClick = (e: MouseEvent) => {
      if (!navRef.current?.contains(e.target as Node) && !toggleRef.current?.contains(e.target as Node)) {
        closeNav();
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('click', onClick);
    };
  }, [closeNav]);

  return (
    <header ref={headerRef} className="site-header fixed top-0 left-0 right-0 z-100 bg-header flex items-center justify-between px-[var(--side-padding)] py-2.5">
      <Link href="/" className="inline-flex items-center" aria-label={logoText}>
        <span
          className="text-brand leading-none select-none text-[36px] max-md:text-[30px]"
          style={{ fontFamily: 'var(--font-italianno), cursive' }}
        >
          {logoText}
        </span>
      </Link>
      <button
        ref={toggleRef}
        type="button"
        className="nav-toggle hidden w-10 h-10 p-0 bg-transparent border-0 cursor-pointer relative"
        aria-label="Open menu"
        aria-expanded="false"
        aria-controls="primary-nav"
        onClick={toggleNav}
      >
        <span className="nav-toggle-bar"></span>
        <span className="nav-toggle-bar"></span>
        <span className="nav-toggle-bar"></span>
      </button>
      <nav ref={navRef} className="nav flex items-center gap-4.5" id="primary-nav">
        <div className="nav-links flex items-center gap-4.5 md:absolute md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 max-md:flex-col max-md:w-full max-md:items-stretch">
          <Link href="/contact" className="text-base font-medium px-2.5 py-2.5 text-text transition-opacity duration-200 hover:opacity-65" onClick={closeNav}>{t('nav.contact')}</Link>
          <Link href="/about" className="text-base font-medium px-2.5 py-2.5 text-text transition-opacity duration-200 hover:opacity-65" onClick={closeNav}>{t('nav.about')}</Link>
          <ActivityLink className="text-base font-medium px-2.5 py-2.5 text-text transition-opacity duration-200 hover:opacity-65" onClick={closeNav}>{t('nav.activity')}</ActivityLink>
        </div>
        <LangSwitcher />
      </nav>
    </header>
  );
}
