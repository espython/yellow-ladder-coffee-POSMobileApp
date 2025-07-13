import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  ScrollView,
  Modal,
  TouchableOpacity,
  Alert,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Toast from "react-native-toast-message";
import { generateUUID } from "@/utils/uuid";
import { Button } from "@/components/Button";
import DrinkCard from "@/components/DrinkCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { ApiService } from "@/services/api";
import { DRINKS_DATA, formatPrice } from "@/utils/constants";
import type { DrinkItem, DrinkSize, OrderItem, Order } from "@/types";

interface DrinkSelectionScreenProps {
  navigation?: any; // For future navigation needs
}

export const DrinkSelectionScreen: React.FC<DrinkSelectionScreenProps> = () => {
  // State management
  const [currentOrder, setCurrentOrder] = useState<OrderItem[]>([]);
  const [selectedDrink, setSelectedDrink] = useState<DrinkItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<
    DrinkSize | undefined | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const [showSizeModal, setShowSizeModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Hooks
  const networkStatus = useNetworkStatus();
  const { queueStats, addOfflineOrder, processOfflineOrders, isProcessing } =
    useOfflineQueue();

  // Computed values
  const totalPrice = useMemo(() => {
    return currentOrder.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  }, [currentOrder]);

  const orderCount = useMemo(() => {
    return currentOrder.reduce((count, item) => count + item.quantity, 0);
  }, [currentOrder]);

  // Event handlers
  const handleDrinkPress = useCallback((drink: DrinkItem) => {
    setSelectedDrink(drink);
    setSelectedSize(drink.sizes[0]); // Default to first size
    setQuantity(1);
    setShowSizeModal(true);
  }, []);

  const handleSizeSelection = useCallback((size: DrinkSize) => {
    setSelectedSize(size);
  }, []);

  const handleQuantityChange = useCallback((change: number) => {
    setQuantity((prev) => Math.max(1, prev + change));
  }, []);

  const handleAddToOrder = useCallback(() => {
    if (!selectedDrink || !selectedSize) return;

    const orderItem: OrderItem = {
      id: generateUUID(),
      drinkId: selectedDrink.id,
      name: selectedDrink.name,
      size: selectedSize.size,
      price: selectedSize.price,
      quantity,
      emoji: selectedDrink.emoji,
    };

    // Check if item already exists (same drink and size)
    const existingItemIndex = currentOrder.findIndex(
      (item) =>
        item.drinkId === selectedDrink.id && item.size === selectedSize.size,
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      const updatedOrder = [...currentOrder];
      const existingItem = updatedOrder[existingItemIndex] as OrderItem;
      updatedOrder[existingItemIndex] = {
        ...existingItem,
        quantity: existingItem.quantity + quantity,
      };
      setCurrentOrder(updatedOrder);
    } else {
      // Add new item
      setCurrentOrder((prev) => [...prev, orderItem]);
    }

    // Reset modal state
    setShowSizeModal(false);
    setSelectedDrink(null);
    setSelectedSize(null);
    setQuantity(1);

    // Show success toast
    Toast.show({
      type: "success",
      text1: "Added to Order! 🎉",
      text2: `${quantity}x ${selectedDrink.name} (${selectedSize.size})`,
      visibilityTime: 2000,
    });
  }, [selectedDrink, selectedSize, quantity, currentOrder]);

  const handleRemoveFromOrder = useCallback((itemId: string) => {
    setCurrentOrder((prev) => prev.filter((item) => item.id !== itemId));
    Toast.show({
      type: "info",
      text1: "Item Removed",
      text2: "Item removed from order",
      visibilityTime: 1500,
    });
  }, []);

  const handleUpdateQuantity = useCallback(
    (itemId: string, newQuantity: number) => {
      if (newQuantity <= 0) {
        handleRemoveFromOrder(itemId);
        return;
      }

      setCurrentOrder((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item,
        ),
      );
    },
    [handleRemoveFromOrder],
  );

  const handleSubmitOrder = useCallback(async () => {
    if (currentOrder.length === 0) {
      Toast.show({
        type: "error",
        text1: "Empty Order",
        text2: "Please add items to your order",
      });
      return;
    }

    setIsSubmitting(true);

    const order: Order = {
      id: generateUUID(),
      items: currentOrder,
      totalPrice,
      timestamp: new Date().toISOString(),
      status: "pending",
      isOffline: !networkStatus.isConnected,
    };

    try {
      if (networkStatus.isConnected) {
        // Try to submit online
        const response = await ApiService.submitOrder(order);

        if (response.success) {
          Toast.show({
            type: "success",
            text1: "Order Submitted! ✅",
            text2: `Order #${response.orderId?.slice(-8)} - ${formatPrice(totalPrice)}`,
            visibilityTime: 4000,
          });
          setCurrentOrder([]);
        } else {
          throw new Error(response.message);
        }
      } else {
        // Save offline
        await addOfflineOrder(order);
        Toast.show({
          type: "info",
          text1: "Order Saved Offline 📱",
          text2: "Will submit when connection is restored",
          visibilityTime: 4000,
        });
        setCurrentOrder([]);
      }
    } catch (error) {
      console.error("Failed to save  order:", error);
      // Save as offline order if online submission fails
      try {
        await addOfflineOrder(order);
        Toast.show({
          type: "info",
          text1: "Order Saved Offline 📱",
          text2: "Will retry when connection improves",
          visibilityTime: 4000,
        });
        setCurrentOrder([]);
      } catch (offlineError) {
        console.error("Failed to save offline order:", offlineError);
        Toast.show({
          type: "error",
          text1: "Order Failed",
          text2: "Unable to save order. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [currentOrder, totalPrice, networkStatus.isConnected, addOfflineOrder]);

  const handleClearOrder = useCallback(() => {
    Alert.alert(
      "Clear Order",
      "Are you sure you want to clear your current order?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => {
            setCurrentOrder([]);
            Toast.show({
              type: "info",
              text1: "Order Cleared",
              text2: "Your order has been cleared",
            });
          },
        },
      ],
    );
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refresh network status
      networkStatus.refreshNetworkStatus();

      // Process offline orders if connected
      if (networkStatus.isConnected && queueStats.total > 0) {
        await processOfflineOrders();
      }
    } catch (error) {
      console.error("Refresh failed:", error);
    } finally {
      setRefreshing(false);
    }
  }, [networkStatus, queueStats.total, processOfflineOrders]);

  const handleCloseModal = useCallback(() => {
    setShowSizeModal(false);
    setSelectedDrink(null);
    setSelectedSize(null);
    setQuantity(1);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-gray-50" edges={["top"]}>
      <StatusBar style="dark" backgroundColor="#f9fafb" />
      <OfflineIndicator />

      {/* Header */}
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

        {/* Offline Orders Status */}
        {queueStats.total > 0 && (
          <View className="mt-3 px-3 py-2 bg-warning-100 rounded-lg flex-row items-center justify-between">
            <View className="flex-1">
              <Text className="text-warning-800 text-sm font-medium">
                📦 {queueStats.total} order(s) pending sync
              </Text>
              {queueStats.failed > 0 && (
                <Text className="text-warning-700 text-xs mt-1">
                  {queueStats.failed} failed, {queueStats.pending} pending
                </Text>
              )}
            </View>
            {isProcessing && (
              <View className="ml-2">
                <LoadingSpinner size="small" />
              </View>
            )}
          </View>
        )}
      </View>

      {/* Main Content */}
      <ScrollView
        className="flex-1 px-4"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Menu Header */}
        <View className="py-4">
          <Text className="text-lg font-semibold text-gray-800 mb-1">Menu</Text>
          <Text className="text-gray-600 text-sm">
            {DRINKS_DATA.length} drinks available • Tap to customize
          </Text>
        </View>

        {/* Drinks Grid */}
        <View className="pb-4">
          {DRINKS_DATA.map((drink) => (
            <DrinkCard
              key={drink.id}
              drink={drink}
              onPress={handleDrinkPress}
            />
          ))}
        </View>

        {/* Spacer for bottom order summary */}
        {currentOrder.length > 0 && <View className="h-64" />}
      </ScrollView>

      {/* Current Order Summary */}
      {currentOrder.length > 0 && (
        <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <View className="px-4 py-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-lg font-semibold text-gray-800">
                Current Order ({orderCount} items)
              </Text>
              <TouchableOpacity onPress={handleClearOrder} className="p-1">
                <Text className="text-error-500 text-sm font-medium">
                  Clear All
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              className="max-h-32 mb-4"
              showsVerticalScrollIndicator={false}
            >
              {currentOrder.map((item) => (
                <View
                  key={item.id}
                  className="flex-row items-center justify-between py-2"
                >
                  <View className="flex-1 flex-row items-center">
                    <Text className="text-lg mr-2">{item.emoji}</Text>
                    <View className="flex-1">
                      <Text className="font-medium text-gray-800">
                        {item.name}
                      </Text>
                      <Text className="text-sm text-gray-600 capitalize">
                        {item.size} - {formatPrice(item.price)} each
                      </Text>
                    </View>
                  </View>

                  <View className="flex-row items-center">
                    {/* Quantity Controls */}
                    <View className="flex-row items-center mr-3">
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity - 1)
                        }
                        className="w-8 h-8 bg-gray-200 rounded-full items-center justify-center"
                      >
                        <Text className="text-gray-700 font-bold">−</Text>
                      </TouchableOpacity>
                      <Text className="mx-3 font-semibold text-gray-800">
                        {item.quantity}
                      </Text>
                      <TouchableOpacity
                        onPress={() =>
                          handleUpdateQuantity(item.id, item.quantity + 1)
                        }
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
                    <TouchableOpacity
                      onPress={() => handleRemoveFromOrder(item.id)}
                      className="p-1"
                    >
                      <Text className="text-error-500 text-lg">🗑️</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            {/* Order Total */}
            <View className="flex-row items-center justify-between mb-4 pt-3 border-t border-gray-200">
              <Text className="text-xl font-bold text-gray-800">Total:</Text>
              <Text className="text-xl font-bold text-primary-600">
                {formatPrice(totalPrice)}
              </Text>
            </View>

            {/* Submit Button */}
            <Button
              title={
                networkStatus.isConnected
                  ? `Submit Order (${formatPrice(totalPrice)})`
                  : `Save Order Offline (${formatPrice(totalPrice)})`
              }
              onPress={handleSubmitOrder}
              loading={isSubmitting}
              size="lg"
              fullWidth
              icon={<Text className="text-white text-lg">🚀</Text>}
            />
          </View>
        </View>
      )}

      {/* Size Selection Modal */}
      <Modal
        visible={showSizeModal}
        transparent
        animationType="slide"
        onRequestClose={handleCloseModal}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl px-6 py-6 max-h-[80%]">
            {selectedDrink && (
              <>
                {/* Drink Header */}
                <View className="flex-row items-center mb-6">
                  <Text className="text-4xl mr-3">{selectedDrink.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-xl font-bold text-gray-800">
                      {selectedDrink.name}
                    </Text>
                    <Text className="text-gray-600 mt-1">
                      {selectedDrink.description}
                    </Text>
                    {selectedDrink.popular && (
                      <View className="bg-primary-100 px-2 py-1 rounded-full mt-2 self-start">
                        <Text className="text-xs font-semibold text-primary-700">
                          🔥 Popular
                        </Text>
                      </View>
                    )}
                  </View>
                </View>

                {/* Size Selection */}
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Select Size
                </Text>
                <View className="space-y-2 mb-6">
                  {selectedDrink.sizes.map((size) => (
                    <TouchableOpacity
                      key={size.size}
                      onPress={() => handleSizeSelection(size)}
                      className={`
                        p-4 rounded-xl border-2 flex-row justify-between items-center
                        ${
                          selectedSize?.size === size.size
                            ? "border-primary-500 bg-primary-50"
                            : "border-gray-200 bg-white"
                        }
                      `}
                    >
                      <View>
                        <Text
                          className={`
                            font-semibold capitalize
                            ${
                              selectedSize?.size === size.size
                                ? "text-primary-700"
                                : "text-gray-800"
                            }
                          `}
                        >
                          {size.size}
                        </Text>
                        <Text className="text-gray-600 text-sm">
                          {size.volume}
                        </Text>
                      </View>
                      <Text
                        className={`
                          font-bold text-lg
                          ${
                            selectedSize?.size === size.size
                              ? "text-primary-600"
                              : "text-gray-800"
                          }
                        `}
                      >
                        {formatPrice(size.price)}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Quantity Selection */}
                <Text className="text-lg font-semibold text-gray-800 mb-3">
                  Quantity
                </Text>
                <View className="flex-row items-center justify-center mb-6">
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(-1)}
                    className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center"
                  >
                    <Text className="text-xl font-bold text-gray-700">−</Text>
                  </TouchableOpacity>
                  <Text className="mx-6 text-2xl font-bold text-gray-800">
                    {quantity}
                  </Text>
                  <TouchableOpacity
                    onPress={() => handleQuantityChange(1)}
                    className="w-12 h-12 bg-primary-500 rounded-full items-center justify-center"
                  >
                    <Text className="text-xl font-bold text-white">+</Text>
                  </TouchableOpacity>
                </View>

                {/* Price Preview */}
                {selectedSize && (
                  <View className="bg-gray-50 p-4 rounded-xl mb-6">
                    <View className="flex-row justify-between items-center">
                      <Text className="text-gray-600">
                        {quantity}x {selectedDrink.name} ({selectedSize.size})
                      </Text>
                      <Text className="font-bold text-lg text-primary-600">
                        {formatPrice(selectedSize.price * quantity)}
                      </Text>
                    </View>
                  </View>
                )}

                {/* Action Buttons */}
                <View className="flex-row space-x-3">
                  <Button
                    title="Cancel"
                    onPress={handleCloseModal}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                  />
                  <Button
                    title={`Add ${quantity} to Order`}
                    onPress={handleAddToOrder}
                    size="lg"
                    className="flex-1"
                    disabled={!selectedSize}
                  />
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};
