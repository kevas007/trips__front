// app/index.tsx
import { Redirect } from 'expo-router';
import { useAuth } from '../state/auth';

export default function Index() {
  const token = useAuth(state => state.token);
  const isLoading = useAuth(state => state.isLoading);

  if (isLoading) {
    return null; // ou ton écran de chargement
  }

  return (
    // une seule redirection, sur /auth/login ou vers les onglets
    <Redirect href={token ? '/(tabs)/home' : '/auth/login'} />
  );
}
