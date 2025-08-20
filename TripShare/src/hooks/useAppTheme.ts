import { useThemeStore } from '../store';

export const useAppTheme = () => {
  const theme = useThemeStore(state => state.getTheme());
  const isDark = useThemeStore(state => state.isDark());
  const toggleTheme = useThemeStore(state => state.toggleTheme);
  
  return {
    theme,
    isDark,
    toggleTheme,
  };
};