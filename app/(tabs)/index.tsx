// app/(tabs)/index.tsx
import { useEffect } from "react";
import { View, Text } from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/state/auth";

export default function TabOneScreen() {
  const token = useAuth((s) => s.token);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace("/auth/login");
    }
  }, [token]);

  if (!token) return null;

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Text className="text-xl font-semibold">Bienvenue sur Tripshare !</Text>
    </View>
  );
}
