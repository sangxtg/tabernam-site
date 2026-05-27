'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SiteSettings } from './directus';

const defaults: SiteSettings = {
  colorBg: '#FFFFFF',
  colorText: '#101823',
  colorMuted: '#5A6B83',
  colorSurface: '#C2CBD7',
  colorButton: '#E9EDF1',
  colorButtonText: '#101823',
  colorButtonHover: '#C2CBD7',
  colorHeader: '#FFFFFF',
  colorBorder: '#C2CBD7',
  colorFooterBg: '#E9EDF1',
  fontFamily: '',
  logoText: 'TaberNam',
  maxWidth: '1512px',
  sidePadding: '40px',
  headerHeight: '60px',
};

const ThemeContext = createContext<SiteSettings>(defaults);

export function ThemeProvider({ settings, children }: { settings: SiteSettings; children: ReactNode }) {
  return (
    <ThemeContext.Provider value={settings}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
