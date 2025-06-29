import { useTheme } from '@/contexts/ThemeContext';
import { useTranslation } from 'react-i18next';

export const useAppTheme = () => {
  const { theme, isDark, toggleTheme, setTheme, fontSize, setFontSize } = useTheme();
  const { t, i18n } = useTranslation();

  // Protection contre les thèmes non initialisés avec couleurs Material Design 3
  if (!theme || !theme.colors) {
    console.warn('Thème non initialisé, utilisation des valeurs par défaut Material Design 3');
    return {
      theme: {
        colors: {
          primary: ['#008080', '#B2DFDF', '#FFFFFF'], // Material 3 Light
          background: {
            primary: '#FAFAFA', // md_theme_light_background
            card: '#FFFFFF', // md_theme_light_surface
            overlay: 'rgba(28, 27, 31, 0.8)',
            gradient: ['#FAFAFA', '#FFFFFF'], // Background vers surface
          },
          text: {
            primary: '#1C1B1F', // md_theme_light_onBackground
            secondary: '#757575', // Gris moyen
            light: '#FFFFFF', // md_theme_light_onPrimary
          },
          semantic: {
            success: '#34C759',
            warning: '#FF9500',
            error: '#FF3B30',
            info: '#008080', // md_theme_light_primary
          },
          glassmorphism: {
            background: 'rgba(255, 255, 255, 0.7)',
            border: 'rgba(0, 128, 128, 0.15)', // Bordure teal
            shadow: 'rgba(0, 128, 128, 0.10)', // Ombre teal
          },
          border: {
            primary: '#E0E0E0',
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
      getThemeColor: () => '#008080', // md_theme_light_primary
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
          return '#008080'; // Couleur par défaut Material 3 Teal
        }
        value = value[key];
      }
      return value;
    },
  };
};