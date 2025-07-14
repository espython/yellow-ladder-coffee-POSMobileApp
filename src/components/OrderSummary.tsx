import React, { useCallback, useEffect, useRef } from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { Button } from "./Button";
import OrderItem from "./OrderItem";
import { formatPrice } from "@/utils/constants";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import BottomSheet, {
  BottomSheetBackdrop,
  BottomSheetBackdropProps,
  BottomSheetView,
  useBottomSheetSpringConfigs,
} from "@gorhom/bottom-sheet";
import type { OrderItem as OrderItemType } from "@/types";

interface OrderSummaryProps {
  orderItems: OrderItemType[];
  isSubmitting: boolean;
  onUpdateQuantity: (id: string, newQuantity: number) => void;
  onRemoveItem: (id: string) => void;
  onSubmitOrder: () => void;
  onClearOrder: () => void;
}

const OrderSummary: React.FC<OrderSummaryProps> = ({
  orderItems,
  isSubmitting,
  onUpdateQuantity,
  onRemoveItem,
  onSubmitOrder,
  onClearOrder,
}) => {
  const insets = useSafeAreaInsets();
  const bottomSheetRef = useRef<BottomSheet>(null);

  // Calculate total price
  const totalPrice = orderItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const animationConfigs = useBottomSheetSpringConfigs({
    damping: 80,
    overshootClamping: true,
    restDisplacementThreshold: 0.1,
    restSpeedThreshold: 0.1,
    stiffness: 500,
  });

  // Open/close sheet based on order items
  useEffect(() => {
    if (orderItems.length > 0) {
      bottomSheetRef.current?.expand();
    } else {
      bottomSheetRef.current?.close();
    }
  }, [orderItems.length]);

  // Handle backdrop press
  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.2}
      />
    ),
    [],
  );

  // If no items, still render (but closed)
  if (orderItems.length === 0) {
    return (
      <BottomSheet
        ref={bottomSheetRef}
        index={-1}
        animationConfigs={animationConfigs}
        enablePanDownToClose={true}
        backdropComponent={renderBackdrop}
        handleIndicatorStyle={styles.indicator}
      >
        <BottomSheetView
          style={[
            styles.contentContainer,
            { paddingBottom: Math.max(insets.bottom, 16) },
          ]}
        >
          <Text className="text-lg font-bold text-gray-800 mb-4">
            Your Order
          </Text>
          <Text className="text-gray-500 text-center">
            No items in your order
          </Text>
        </BottomSheetView>
      </BottomSheet>
    );
  }

  return (
    <BottomSheet
      ref={bottomSheetRef}
      index={0}
      enablePanDownToClose={true}
      animationConfigs={animationConfigs}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.indicator}
    >
      <BottomSheetView
        style={[
          styles.contentContainer,
          { paddingBottom: Math.max(insets.bottom, 16) },
        ]}
      >
        {/* Order Items Summary */}
        <View className="mb-2">
          <View className="flex-row justify-between items-center mb-4">
            <Text className="text-xl font-bold text-gray-800">Your Order</Text>
            {orderItems.length > 0 && (
              <Pressable
                onPress={onClearOrder}
                className="py-1 px-3 bg-red-50 rounded-md"
              >
                <Text className="text-red-600 font-medium">Clear All</Text>
              </Pressable>
            )}
          </View>

          <View className="max-h-48">
            {orderItems.map((item) => (
              <OrderItem
                key={item.id}
                item={item}
                onUpdateQuantity={(change) => {
                  const newQuantity = item.quantity + change;
                  onUpdateQuantity(item.id, newQuantity);
                }}
                onRemove={() => onRemoveItem(item.id)}
              />
            ))}
          </View>
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
      </BottomSheetView>
    </BottomSheet>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    padding: 16,
  },
  indicator: {
    backgroundColor: "#CBD5E1",
    width: 40,
    height: 5,
  },
});

export default OrderSummary;
