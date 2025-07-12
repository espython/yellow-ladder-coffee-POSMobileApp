import React from "react";
import { View, ActivityIndicator, Text } from "react-native";

interface LoadingSpinnerProps {
  message?: string;
  size?: "small" | "large";
  color?: string;
  overlay?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = "Loading...",
  size = "large",
  color = "#f97316",
  overlay = false,
}) => {
  const containerClass = overlay
    ? "absolute inset-0 bg-white/80 backdrop-blur-sm z-50"
    : "flex-1 bg-white";

  return (
    <View className={`${containerClass} justify-center items-center p-6`}>
      <ActivityIndicator size={size} color={color} />
      {message && (
        <Text className="mt-4 text-gray-600 text-base text-center font-medium">
          {message}
        </Text>
      )}
    </View>
  );
};
