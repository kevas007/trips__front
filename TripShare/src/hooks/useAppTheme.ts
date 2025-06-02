export const useAppTheme = () => {
  const { theme, isDark, toggleTheme, setTheme } = useTheme();
  const { language, t, setLanguage, toggleLanguage } = useLanguage();

  return {
    // Theme
    theme,
    isDark,
    toggleTheme,
    setTheme,
    
    // Language
    language,
    t,
    setLanguage,
    toggleLanguage,
    
    // Utilities
    getThemeColor: (path: string) => {
      const keys = path.split('.');
      let value: any = theme.colors;
      for (const key of keys) {
        value = value[key];
      }
      return value;
    },
    
    getTranslation: (path: string) => {
      const keys = path.split('.');
      let value: any = t;
      for (const key of keys) {
        value = value[key];
      }
      return value;
    },
  };
};