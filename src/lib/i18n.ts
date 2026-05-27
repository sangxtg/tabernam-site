export interface LangInfo {
  code: string;
  name: string;
  flag: string;
  isDefault: boolean;
}

export const FALLBACK_LANGS: LangInfo[] = [
  { code: 'en', name: 'English', flag: '\u{1F1FA}\u{1F1F8}', isDefault: true },
  { code: 'sk', name: 'Slovakia', flag: '\u{1F1F8}\u{1F1F0}', isDefault: false },
];

export const FALLBACK_DICTIONARIES: Record<string, Record<string, string>> = {
  en: {
    'page.title.home': 'TABERNAM',
    'page.title.about': 'About me \u2014 TABERNAM',
    'page.title.activity': 'Activity \u2014 TABERNAM',
    'page.title.contact': 'Contact \u2014 TABERNAM',
    'nav.contact': 'Contact',
    'nav.about': 'About me',
    'nav.activity': 'Activity',
    'nav.home': 'Home',
    'btn.getStarted': 'Get started',
    'btn.exploreNow': 'Explore now',
    'btn.viewCities': 'View cities',
    'btn.goBack': 'Go back',
    'btn.learnMore': 'Learn more',
    'btn.viewCV': 'View my CV',
    'heading.aboutMe': 'About me',
    'heading.contact': 'Contact',
    'footer.navigation': 'Navigation',
    'footer.contact': 'Contact',
    'footer.copyright': '\u00a9 2026 Tabernam. All rights reserved.',
    'contact.address1': 'Address 1',
    'contact.address2': 'Address 2',
    'contact.address3': 'Address 3',
    'aria.prevCity': 'Previous city',
    'aria.nextCity': 'Next city',
    'aria.cities': 'Cities',
    'aria.footerNav': 'Footer navigation',
  },
  sk: {
    'page.title.home': 'TABERNAM',
    'page.title.about': 'O mne \u2014 TABERNAM',
    'page.title.activity': 'Aktivita \u2014 TABERNAM',
    'page.title.contact': 'Kontakt \u2014 TABERNAM',
    'nav.contact': 'Kontakt',
    'nav.about': 'O mne',
    'nav.activity': 'Aktivita',
    'nav.home': 'Domov',
    'btn.getStarted': 'Za\u010da\u0165',
    'btn.exploreNow': 'Objavi\u0165 teraz',
    'btn.viewCities': 'Zobrazi\u0165 mest\u00e1',
    'btn.goBack': 'Sp\u00e4\u0165',
    'btn.learnMore': 'Zisti\u0165 viac',
    'btn.viewCV': 'Zobrazi\u0165 \u017eivotopis',
    'heading.aboutMe': 'O mne',
    'heading.contact': 'Kontakt',
    'footer.navigation': 'Navig\u00e1cia',
    'footer.contact': 'Kontakt',
    'footer.copyright': '\u00a9 2026 Tabernam. V\u0161etky pr\u00e1va vyhraden\u00e9.',
    'contact.address1': 'Adresa 1',
    'contact.address2': 'Adresa 2',
    'contact.address3': 'Adresa 3',
    'aria.prevCity': 'Predch\u00e1dzaj\u00face mesto',
    'aria.nextCity': '\u010eal\u0161ie mesto',
    'aria.cities': 'Mest\u00e1',
    'aria.footerNav': 'Navig\u00e1cia v p\u00e4te str\u00e1nky',
  },
};

export function getLang(supportedCodes: string[]): string {
  if (typeof window === 'undefined') return supportedCodes[0] || 'en';
  try {
    const saved = localStorage.getItem('lang');
    if (saved && supportedCodes.includes(saved)) return saved;
  } catch {
    // private mode
  }
  return supportedCodes[0] || 'en';
}

export function setLang(lang: string): void {
  try {
    localStorage.setItem('lang', lang);
  } catch {
    // private mode
  }
}
