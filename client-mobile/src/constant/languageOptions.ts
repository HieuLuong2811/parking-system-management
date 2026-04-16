export const languageOptions = [
  { code: 'vi', name: 'Tiếng Việt', flag: 'https://flagcdn.com/w40/vn.png' },
  { code: 'en', name: 'English', flag: 'https://flagcdn.com/w40/gb.png' },
  { code: 'ja', name: '日本語', flag: 'https://flagcdn.com/w40/jp.png' },
  { code: 'th', name: 'ไทย', flag: 'https://flagcdn.com/w40/th.png' },
] as const;

export type LanguageCode = (typeof languageOptions)[number]['code'];