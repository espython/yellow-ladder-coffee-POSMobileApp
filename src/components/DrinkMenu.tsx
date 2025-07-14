import React from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import DrinkCard from "./DrinkCard";
import type { DrinkItem } from "@/types";

interface DrinkMenuProps {
  drinks: DrinkItem[];
  onDrinkPress: (drink: DrinkItem) => void;
  refreshing: boolean;
  onRefresh: () => void;
  children?: React.ReactNode;
}

export const DrinkMenu: React.FC<DrinkMenuProps> = ({
  drinks,
  onDrinkPress,
  refreshing,
  onRefresh,
  children,
}) => {
  return (
    <ScrollView
      className="flex-1 px-4"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Menu Header */}
      <View className="py-4">
        <Text className="text-lg font-semibold text-gray-800 mb-1">Menu</Text>
        <Text className="text-gray-600 text-sm">
          {drinks.length} drinks available • Tap to customize
        </Text>
      </View>

      {/* Drinks Grid */}
      <View className="pb-4">
        {drinks.map((drink) => (
          <DrinkCard key={drink.id} drink={drink} onPress={onDrinkPress} />
        ))}
      </View>

      {children}
    </ScrollView>
  );
};

export default DrinkMenu;
