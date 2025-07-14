import React from "react";
import {
  Text,
  TouchableOpacity,
  ActivityIndicator,
  View,
  TouchableOpacityProps,
} from "react-native";

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled = false,
  ...props
}) => {
  // Styling based on variant
  const getVariantStyles = () => {
    switch (variant) {
      case "primary":
        return {
          background: "bg-primary-500",
          text: "text-white",
          activeBackground: "active:bg-primary-600",
          disabledBackground: "bg-primary-300",
          border: "border-transparent",
        };
      case "secondary":
        return {
          background: "bg-gray-100",
          text: "text-gray-800",
          activeBackground: "active:bg-gray-200",
          disabledBackground: "bg-gray-50",
          border: "border-transparent",
        };
      case "outline":
        return {
          background: "bg-white",
          text: "text-primary-500",
          activeBackground: "active:bg-gray-50",
          disabledBackground: "bg-white",
          border: "border-primary-500",
        };
      case "danger":
        return {
          background: "bg-error-500",
          text: "text-white",
          activeBackground: "active:bg-error-600",
          disabledBackground: "bg-error-300",
          border: "border-transparent",
        };
      default:
        return {
          background: "bg-primary-500",
          text: "text-white",
          activeBackground: "active:bg-primary-600",
          disabledBackground: "bg-primary-300",
          border: "border-transparent",
        };
    }
  };

  // Styling based on size
  const getSizeStyles = () => {
    switch (size) {
      case "sm":
        return {
          padding: "px-3 py-1",
          text: "text-sm",
          height: "h-8",
        };
      case "md":
        return {
          padding: "px-4 py-2",
          text: "text-base",
          height: "h-10",
        };
      case "lg":
        return {
          padding: "px-5 py-3",
          text: "text-base",
          height: "h-12",
        };
      default:
        return {
          padding: "px-4 py-2",
          text: "text-base",
          height: "h-10",
        };
    }
  };

  const variantStyles = getVariantStyles();
  const sizeStyles = getSizeStyles();

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || isLoading}
      className={`
        ${variantStyles.background}
        ${variantStyles.activeBackground}
        ${disabled ? variantStyles.disabledBackground : ""}
        ${sizeStyles.padding}
        ${sizeStyles.height}
        border rounded-lg items-center justify-center
        ${variantStyles.border}
        ${className}
      `}
      activeOpacity={0.7}
      {...props}
    >
      <View className="flex-row items-center justify-center">
        {isLoading ? (
          <ActivityIndicator
            color={variant === "outline" ? "#6366f1" : "#ffffff"}
            size="small"
          />
        ) : (
          <>
            {icon && <View className="mr-2">{icon}</View>}
            <Text
              className={`
                font-medium
                ${variantStyles.text}
                ${sizeStyles.text}
                ${disabled ? "opacity-60" : ""}
              `}
            >
              {title}
            </Text>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
};

export default Button;
