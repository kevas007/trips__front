// app/auth/login.tsx
import { useState, useEffect } from "react";
import {
  View,
  Text,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { useRouter } from "expo-router";
import { useAuth } from "@/state/auth";
import { Input } from "@/components/Input";
import { Button } from "@/components/Button";

export default function Login() {
  const router = useRouter();
  const { login, isLoading, token } = useAuth((s) => ({
    login: s.login,
    isLoading: s.isLoading,
    token: s.token,
  }));

  // Si l’utilisateur est déjà connecté, on redirige UNE SEULE FOIS
  useEffect(() => {
    if (token) {
      router.replace("/");  
    }
  }, [token]);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      await login(email, password);
      if (!token) {
        Alert.alert("Erreur", "Identifiants invalides");
      }
    } catch {
      Alert.alert("Erreur", "Une erreur est survenue");
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1 justify-center px-6 bg-white"
    >
      <Image
        source={require("@/assets/images/tirps_logo.png")}
        style={{
          width: 80,
          height: 80,
          alignSelf: "center",
          marginBottom: 24,
        }}
        resizeMode="contain"
      />

      <Text className="text-3xl font-bold mb-8 text-center">Connexion</Text>

      <Input
        label="Email"
        placeholder="email@exemple.com"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
      />

      <Input
        label="Mot de passe"
        placeholder="••••••••"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Button
        title={isLoading ? "Connexion..." : "Se connecter"}
        onPress={handleSubmit}
        disabled={isLoading}
      />
    </KeyboardAvoidingView>
  );
}
