import React from "react";
import { Text, View, Pressable } from "react-native";
import { DrinkItem } from "@/types";
import {
  getLowestPrice,
  getCategoryColor,
  formatPrice,
} from "@/utils/constants";

interface DrinkCardProps {
  drink: DrinkItem;
  onPress: (drink: DrinkItem) => void;
}

const DrinkCard: React.FC<DrinkCardProps> = ({ drink, onPress }) => {
  const categoryColors = getCategoryColor(drink.category);
  const lowestPrice = getLowestPrice(drink.sizes);

  return (
    <Pressable
      onPress={() => onPress(drink)}
      className={`
        p-4 rounded-2xl border-2 mb-3 mx-1
        ${categoryColors.border} ${categoryColors.background}
        active:scale-[0.98] active:opacity-80
        shadow-sm shadow-gray-200/50
      `}
      android_ripple={{ color: "rgba(0,0,0,0.1)" }}
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <View className="flex-row items-center mb-2">
            <Text className="text-4xl mr-3">{drink.emoji}</Text>
            <View className="flex-1">
              <View className="flex-row items-center flex-wrap">
                <Text className="text-lg font-bold text-gray-800 mr-2">
                  {drink.name}
                </Text>
                {drink.popular && (
                  <View className="bg-primary-100 px-2 py-1 rounded-full">
                    <Text className="text-xs font-semibold text-primary-700">
                      🔥 Popular
                    </Text>
                  </View>
                )}
              </View>
              <Text className="text-sm text-gray-600 mt-1 leading-5">
                {drink.description}
              </Text>
            </View>
          </View>
        </View>

        <View className="items-end ml-3">
          <Text className="text-xl font-bold text-primary-600">
            {formatPrice(lowestPrice)}+
          </Text>
          <View className="flex-row items-center mt-1">
            <View
              className={`px-2 py-1 rounded-full ${categoryColors.background}`}
            >
              <Text
                className={`text-xs font-medium capitalize ${categoryColors.text}`}
              >
                {drink.category}
              </Text>
            </View>
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {drink.sizes.length} sizes
          </Text>
        </View>
      </View>

      {/* Quick preview of sizes */}
      <View className="flex-row justify-between items-center mt-3 pt-3 border-t border-gray-200/50">
        {drink.sizes.map((size) => (
          <View key={size.size} className="flex-1 items-center">
            <Text className="text-xs font-medium text-gray-600 capitalize">
              {size.size}
            </Text>
            <Text className="text-sm font-semibold text-gray-800">
              {formatPrice(size.price)}
            </Text>
            <Text className="text-xs text-gray-500">{size.volume}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
};

export default DrinkCard;
