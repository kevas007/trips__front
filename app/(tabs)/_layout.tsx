// app/(tabs)/_layout.tsx
import { Tabs, Redirect } from 'expo-router';
import { useAuth } from '../../state/auth';

export default function TabsLayout() {
  const token = useAuth(state => state.token);
  const isLoading = useAuth(state => state.isLoading);

  if (isLoading) {
    return null;
  }
  if (!token) {
    // si pas de token, on renvoie vers /auth/login
    return <Redirect href="/auth/login" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="home" options={{ title: 'Accueil' }} />
      <Tabs.Screen name="two"  options={{ title: 'Deuxième' }} />
    </Tabs>
  );
}
