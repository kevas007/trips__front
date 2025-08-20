import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '../types/theme';

type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: 'light' | 'dark' | 'system') => void;
  fontSize: 'Petit' | 'Normal' | 'Grand' | 'Très grand';
  setFontSize: (size: 'Petit' | 'Normal' | 'Grand' | 'Très grand') => void;
};

const defaultTheme: ThemeContextType = {
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
  fontSize: 'Normal',
  setFontSize: () => {},
};

const ThemeContext = createContext<ThemeContextType>(defaultTheme);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<'light' | 'dark' | 'system'>('system');
  const [isDark, setIsDark] = useState(systemColorScheme === 'dark');
  const [fontSize, setFontSize] = useState<'Petit' | 'Normal' | 'Grand' | 'Très grand'>('Normal');
  const [isLoading, setIsLoading] = useState(true);

  // Initialiser le thème immédiatement
  const theme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme) {
          setThemeMode(savedTheme as 'light' | 'dark' | 'system');
        }
      } catch (error) {
        console.error('Erreur lors du chargement du thème:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, []);

  useEffect(() => {
    if (themeMode === 'system') {
      setIsDark(systemColorScheme === 'dark');
    } else {
      setIsDark(themeMode === 'dark');
    }
  }, [themeMode, systemColorScheme]);

  const toggleTheme = () => {
    const newTheme = isDark ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const setTheme = async (newTheme: 'light' | 'dark' | 'system') => {
    try {
      await AsyncStorage.setItem('theme', newTheme);
      setThemeMode(newTheme);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde du thème:', error);
    }
  };

  const value = {
    theme,
    isDark,
    toggleTheme,
    setTheme,
    fontSize,
    setFontSize,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme doit être utilisé à l\'intérieur d\'un ThemeProvider');
  }
  return context;
}; 