import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { formatPrice } from "@/utils/constants";
import type { OrderItem as OrderItemType } from "@/types";

interface OrderItemProps {
  item: OrderItemType;
  onUpdateQuantity: (change: number) => void;
  onRemove: () => void;
}

export const OrderItem: React.FC<OrderItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
}) => {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 flex-row items-center">
        <Text className="text-lg mr-2">{item.emoji}</Text>
        <View className="flex-1">
          <Text className="font-medium text-gray-800">{item.name}</Text>
          <Text className="text-sm text-gray-600 capitalize">
            {item.size} - {formatPrice(item.price)} each
          </Text>
        </View>
      </View>

      <View className="flex-row items-center">
        {/* Quantity Controls */}
        <View className="flex-row items-center mr-3">
          <TouchableOpacity
            onPress={() => onUpdateQuantity(-1)}
            className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
          >
            <Text className="text-gray-700 font-bold">−</Text>
          </TouchableOpacity>
          <Text className="mx-3 font-semibold text-gray-800">
            {item.quantity}
          </Text>
          <TouchableOpacity
            onPress={() => onUpdateQuantity(1)}
            className="w-8 h-8 bg-primary-500 rounded-full items-center justify-center"
          >
            <Text className="text-white font-bold">+</Text>
          </TouchableOpacity>
        </View>

        {/* Total Price */}
        <Text className="font-bold text-primary-600 mr-3 min-w-[60px] text-right">
          {formatPrice(item.price * item.quantity)}
        </Text>

        {/* Remove Button */}
        <TouchableOpacity onPress={onRemove} className="p-1">
          <Text className="text-error-500 text-lg">🗑️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default OrderItem;
