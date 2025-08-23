import { useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';

// Types pour le thème
export interface Theme {
  colors: {
    primary: string[];
    background: {
      primary: string;
      secondary: string;
      card: string;
    };
    text: {
      primary: string;
      secondary: string;
    };
    border: {
      primary: string;
      secondary: string;
    };
    semantic: {
      success: string;
      error: string;
      warning: string;
      info: string;
    };
  };
}

// Thèmes disponibles
const lightTheme: Theme = {
  colors: {
    primary: ['#008080', '#006666', '#004d4d'],
    background: {
      primary: '#ffffff',
      secondary: '#f8f9fa',
      card: '#ffffff',
    },
    text: {
      primary: '#333333',
      secondary: '#666666',
    },
    border: {
      primary: '#e0e0e0',
      secondary: '#f0f0f0',
    },
    semantic: {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
    },
  },
};

const darkTheme: Theme = {
  colors: {
    primary: ['#00b3b3', '#009999', '#008080'],
    background: {
      primary: '#1a1a1a',
      secondary: '#2d2d2d',
      card: '#333333',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
    },
    border: {
      primary: '#404040',
      secondary: '#505050',
    },
    semantic: {
      success: '#28a745',
      error: '#dc3545',
      warning: '#ffc107',
      info: '#17a2b8',
    },
  },
};

// Hook principal simplifié
export const useAppTheme = () => {
  const colorScheme = useColorScheme();
  const [isDark, setIsDark] = useState(false);
  const [fontSize, setFontSize] = useState<'Petit' | 'Normal' | 'Grand' | 'Très grand'>('Normal');
  const [language, setLanguage] = useState<'fr' | 'en' | 'es' | 'de'>('fr');

  // Thème actuel
  const theme = isDark ? darkTheme : lightTheme;

  // Fonction pour basculer le thème
  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  // Fonction pour basculer la langue
  const toggleLanguage = () => {
    const languages: ('fr' | 'en' | 'es' | 'de')[] = ['fr', 'en', 'es', 'de'];
    const currentIndex = languages.indexOf(language);
    const nextIndex = (currentIndex + 1) % languages.length;
    setLanguage(languages[nextIndex]);
  };

  // Fonction de traduction simple
  const t = (key: string): string => {
    const translations: Record<string, Record<string, string>> = {
      fr: {
        'welcome': 'Bienvenue',
        'login': 'Connexion',
        'register': 'Inscription',
      },
      en: {
        'welcome': 'Welcome',
        'login': 'Login',
        'register': 'Register',
      },
      es: {
        'welcome': 'Bienvenido',
        'login': 'Iniciar sesión',
        'register': 'Registrarse',
      },
      de: {
        'welcome': 'Willkommen',
        'login': 'Anmelden',
        'register': 'Registrieren',
      },
    };
    
    return translations[language]?.[key] || key;
  };

  // Synchroniser avec le système
  useEffect(() => {
    if (colorScheme) {
      setIsDark(colorScheme === 'dark');
    }
  }, [colorScheme]);

  return {
    theme,
    isDark,
    toggleTheme,
    fontSize,
    setFontSize,
    language,
    setLanguage,
    toggleLanguage,
    t,
  };
};
