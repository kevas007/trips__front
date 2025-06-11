export interface Theme {
  colors: {
    primary: string[];
    accent: string[];
    secondary: string[];
    background: {
      primary: string;
      card: string;
      overlay: string;
      gradient: string[];
    };
    text: {
      primary: string;
      secondary: string;
      light: string;
    };
    semantic: {
      success: string;
      warning: string;
      error: string;
      info: string;
    };
    glassmorphism: {
      background: string;
      border: string;
      shadow: string;
    };
    border: string;
    error: string;
  };
  spacing: {
    xs: number;
    sm: number;
    md: number;
    lg: number;
    xl: number;
  };
  borderRadius: {
    sm: number;
    md: number;
    lg: number;
    xl: number;
    full: number;
  };
  typography: {
    h1: {
      fontSize: number;
      fontWeight: string;
    };
    h2: {
      fontSize: number;
      fontWeight: string;
    };
    h3: {
      fontSize: number;
      fontWeight: string;
    };
    body: {
      fontSize: number;
    };
    caption: {
      fontSize: number;
    };
  };
  shadows: {
    sm: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    md: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
    lg: {
      shadowColor: string;
      shadowOffset: {
        width: number;
        height: number;
      };
      shadowOpacity: number;
      shadowRadius: number;
      elevation: number;
    };
  };
}

export interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (isDark: boolean) => void;
  fontSize: 'Petit' | 'Normal' | 'Grand' | 'Très grand';
  setFontSize: (size: 'Petit' | 'Normal' | 'Grand' | 'Très grand') => void;
} 