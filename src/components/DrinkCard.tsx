import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formatPrice } from "@/utils/constants";
import type { DrinkItem } from "@/types";

interface DrinkCardProps {
  drink: DrinkItem;
  onPress: (drink: DrinkItem) => void;
}

export const DrinkCard: React.FC<DrinkCardProps> = ({ drink, onPress }) => {
  // Find the minimum price from all sizes
  const minPrice = Math.min(...drink.sizes.map((size) => size.price));

  return (
    <TouchableOpacity
      className="bg-white rounded-xl p-4 mb-3 border border-gray-100 shadow-sm"
      onPress={() => onPress(drink)}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center">
        {/* Emoji */}
        <View className="mr-4">
          <Text className="text-3xl">{drink.emoji}</Text>
        </View>

        {/* Drink Info */}
        <View className="flex-1">
          <Text className="text-lg font-semibold text-gray-800">
            {drink.name}
          </Text>
          <Text className="text-gray-600 text-sm mb-1" numberOfLines={2}>
            {drink.description}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-primary-600 font-bold">
              From {formatPrice(minPrice)}
            </Text>
            <View className="ml-2 bg-gray-100 px-2 py-1 rounded">
              <Text className="text-xs text-gray-600 capitalize">
                {drink.category}
              </Text>
            </View>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DrinkCard;
