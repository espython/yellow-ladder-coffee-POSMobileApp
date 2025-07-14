import React from "react";
import { View, Text } from "react-native";

interface HeaderSectionProps {
  networkStatus: {
    isConnected: boolean;
  };
}

export const HeaderSection: React.FC<HeaderSectionProps> = ({
  networkStatus,
}) => {
  return (
    <View className="px-4 py-4 bg-white border-b border-gray-200 shadow-sm">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-2xl font-bold text-gray-800">
            ☕ Coffee Shop POS
          </Text>
          <Text className="text-gray-600 mt-1">
            Select your favorite drinks
          </Text>
        </View>

        {networkStatus.isConnected ? (
          <View className="bg-success-100 px-3 py-1 rounded-full">
            <Text className="text-success-700 text-sm font-medium">
              🟢 Online
            </Text>
          </View>
        ) : (
          <View className="bg-error-100 px-3 py-1 rounded-full">
            <Text className="text-error-700 text-sm font-medium">
              🔴 Offline
            </Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default HeaderSection;
