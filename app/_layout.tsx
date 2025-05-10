// app/_layout.tsx
import { Slot } from 'expo-router';

export default function RootLayout() {
  // PAS de navigation ici, uniquement le Slot
  return <Slot />;
}
