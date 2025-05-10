// app/auth/_layout.tsx
import { Slot } from 'expo-router';

export default function AuthLayout() {
  // Toujours seulement le Slot, même si c'est la partie login
  return <Slot />;
}
