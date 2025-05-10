import React from "react";
import { Pressable, Text, PressableProps, ActivityIndicator } from "react-native";

interface ButtonProps extends PressableProps {
  title: string;
  loading?: boolean;
}

export function Button({ title, loading, style, disabled, ...rest }: ButtonProps) {
  return (
    <Pressable
      className={`w-full rounded-lg py-3 items-center justify-center ${
        disabled
          ? "bg-gray-400"
          : "bg-blue-600 hover:bg-blue-700 active:bg-blue-800"
      }`}
      disabled={disabled}
      {...rest}
    >
      {loading ? (
        <ActivityIndicator color="#fff" />
      ) : (
        <Text className="text-white text-base font-semibold">{title}</Text>
      )}
    </Pressable>
  );
}
