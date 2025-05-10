// hooks/useTheme.ts
import { useColorScheme } from "react-native";
import Colors from "@/utils/colors";

export function useTheme() {
  const scheme = useColorScheme() ?? "light";
  return Colors[scheme];
}
