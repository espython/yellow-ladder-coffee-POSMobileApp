import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Button } from "./Button";
import OrderItem from "./OrderItem";
import { formatPrice } from "@/utils/constants";
import type { OrderItem as OrderItemType } from "@/types";

interface OrderSummaryProps {
  orderItems: OrderItemType[];
  isSubmitting: boolean;
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  onSubmitOrder: () => void;
  onClearOrder: () => void;
}

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderItems,
  isSubmitting,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearOrder,
}) => {
  if (orderItems.length === 0) return null;

  // Calculate total price
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return (
    <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-xl">
      {/* Order Header */}
      <View className="flex-row justify-between items-center mb-3">
        <Text className="text-lg font-semibold text-gray-800">
          Current Order ({orderItems.length})
        </Text>
        <TouchableOpacity onPress={onClearOrder}>
          <Text className="text-primary-600 font-medium">Clear All</Text>
        </TouchableOpacity>
      </View>

      {/* Order Items */}
      <View>
        {orderItems.map((item) => (
          <OrderItem
            key={item.id}
            item={item}
            onUpdateQuantity={onUpdateQuantity}
            onRemove={onRemoveItem}
          />
        ))}
      </View>

      {/* Order Total */}
      <View className="flex-row justify-between items-center my-4">
        <Text className="font-medium text-gray-600">Total Amount</Text>
        <Text className="font-bold text-xl text-primary-600">
          {formatPrice(totalPrice)}
        </Text>
      </View>

      {/* Submit Button */}
      <Button
        title={isSubmitting ? "Processing..." : "Submit Order"}
        onPress={onSubmitOrder}
        size="lg"
        className="w-full"
        isLoading={isSubmitting}
      />
    </View>
  );
};

export default OrderSummary;
