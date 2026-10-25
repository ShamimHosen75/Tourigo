export type Locale = 'en' | 'bn' | 'hi';

export interface LanguageOption {
  code: Locale;
  label: string;
  nativeName: string;
  flag: string;
  shortLabel: string;
}

export const SUPPORTED_LOCALES: LanguageOption[] = [
  {
    code: 'en',
    label: 'English',
    nativeName: 'English',
    flag: '🇬🇧',
    shortLabel: 'EN',
  },
  {
    code: 'bn',
    label: 'Bengali',
    nativeName: 'বাংলা',
    flag: '🇧🇩',
    shortLabel: 'বাং',
  },
  {
    code: 'hi',
    label: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳',
    shortLabel: 'हिं',
  },
];
