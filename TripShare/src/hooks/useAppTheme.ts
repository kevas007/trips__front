import { useTheme } from '@/theme/ThemeContext';
import { useTranslation } from 'react-i18next';

export const useAppTheme = () => {
  const { theme, isDark, toggleTheme, setTheme, fontSize, setFontSize } = useTheme();
  const { t, i18n } = useTranslation();

  return {
    // Theme
    theme,
    isDark,
    toggleTheme,
    setTheme,
    fontSize,
    setFontSize,

    // Langue (i18n)
    t,
    language: i18n.language,
    setLanguage: i18n.changeLanguage,

    // Utilities
    getThemeColor: (path: string) => {
      const keys = path.split('.');
      let value: any = theme.colors;
      for (const key of keys) {
        value = value[key];
      }
      return value;
    },
  };
};