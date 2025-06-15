import { useTheme } from '@/theme/ThemeContext';
import { useTranslation } from 'react-i18next';

export const useAppTheme = () => {
  const { theme, isDark, toggleTheme, setTheme, fontSize, setFontSize } = useTheme();
  const { t, i18n } = useTranslation();

  // Protection contre les thèmes non initialisés
  if (!theme || !theme.colors) {
    console.warn('Thème non initialisé, utilisation des valeurs par défaut');
    return {
      theme: {
        colors: {
          primary: ['#667eea', '#5a6fd8', '#4c5bc6', '#434190', '#3c366b'],
          background: {
            primary: '#FFFFFF',
            card: '#F1F5F9',
            overlay: 'rgba(0, 0, 0, 0.8)',
            gradient: ['#667eea', '#764ba2'],
          },
          text: {
            primary: '#1E293B',
            secondary: '#64748B',
            light: 'rgba(30, 41, 59, 0.7)',
          },
          semantic: {
            success: '#22C55E',
            warning: '#F59E0B',
            error: '#E11D48',
            info: '#2563EB',
          },
          glassmorphism: {
            background: 'rgba(241, 245, 249, 0.7)',
            border: 'rgba(100, 116, 139, 0.15)',
            shadow: 'rgba(100, 116, 139, 0.10)',
          },
          border: {
            primary: '#e0e0e0',
          },
        },
        spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32 },
        borderRadius: { sm: 8, md: 12, lg: 16, xl: 24 },
      },
      isDark: false,
      toggleTheme: () => {},
      setTheme: () => {},
      fontSize: 'Normal' as const,
      setFontSize: () => {},
      t: (key: string) => key,
      language: 'fr',
      setLanguage: () => {},
      getThemeColor: () => '#667eea',
    };
  }

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
        if (!value || !value[key]) {
          console.warn(`Propriété de thème manquante: ${path}`);
          return '#667eea'; // Couleur par défaut
        }
        value = value[key];
      }
      return value;
    },
  };
};