import React, { useState, useEffect, useCallback } from "react";
import { View, SafeAreaView } from "react-native";
import { generateUUID } from "@/utils/uuid";
import { ApiService } from "@/services/api";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";
import { showToast } from "@/utils/toast";
import type { DrinkItem, OrderItem, DrinkSize, Order } from "@/types";

// Import the extracted components
import HeaderSection from "@/components/HeaderSection";
import OfflineQueueStatus from "@/components/OfflineQueueStatus";
import DrinkMenu from "@/components/DrinkMenu";
import SizeSelectionModal from "@/components/SizeSelectionModal"; // Fix import statement
import OrderSummary from "@/components/OrderSummary";
import { DRINKS_DATA } from "@/utils/constants";

interface DrinkSelectionScreenProps {}

const DrinkSelectionScreen: React.FC<DrinkSelectionScreenProps> = () => {
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
  const [drinks, setDrinks] = useState<DrinkItem[]>([]);

  // Network and offline queue hooks
  const networkStatus = useNetworkStatus();
  const {
    offlineOrders,
    addOfflineOrder,
    processOfflineOrders,
    queueStats,
    isProcessing,
  } = useOfflineQueue();

  // Fetch drinks
  const fetchDrinks = useCallback(async () => {
    try {
      setRefreshing(true);

      setDrinks(DRINKS_DATA);
    } catch (error) {
      console.error("Error fetching drinks:", error);
      showToast("error", "Failed to load drinks menu");
    } finally {
      setRefreshing(false);
    }
  }, []);

  // Initial data fetching
  useEffect(() => {
    fetchDrinks();
  }, [fetchDrinks]);

  // Handle drink selection
  const handleDrinkPress = (drink: DrinkItem) => {
    setSelectedDrink(drink);
    setSelectedSize(null);
    setQuantity(1);
    setShowSizeModal(true);
  };

  // Handle size selection
  const handleSizeSelect = (size: DrinkSize) => {
    setSelectedSize(size);
  };

  // Handle quantity change
  const handleQuantityChange = (change: number) => {
    setQuantity((prev) => {
      const newQuantity = prev + change;
      return newQuantity > 0 ? newQuantity : 1;
    });
  };

  // Add drink to order
  const handleAddToOrder = () => {
    if (!selectedDrink || !selectedSize) return;

    const newItem: OrderItem = {
      id: generateUUID(),
      drinkId: selectedDrink.id,
      name: selectedDrink.name,
      emoji: selectedDrink.emoji,
      size: selectedSize.size,
      price: selectedSize.price,
      quantity,
    };

    setCurrentOrder((prev) => [...prev, newItem]);
    setShowSizeModal(false);
    setSelectedDrink(null);
    setSelectedSize(null);
  };

  // Update item quantity
  const handleUpdateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setCurrentOrder((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item,
      ),
    );
  };

  // Remove item from order
  const handleRemoveItem = (id: string) => {
    setCurrentOrder((prev) => prev.filter((item) => item.id !== id));
  };

  // Clear entire order
  const handleClearOrder = () => {
    setCurrentOrder([]);
  };

  // Submit order
  const handleSubmitOrder = async () => {
    if (currentOrder.length === 0) return;

    setIsSubmitting(true);

    const order: Order = {
      id: generateUUID(),
      items: currentOrder,
      totalPrice: currentOrder.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      ),
      timestamp: new Date().toISOString(),
      status: "pending",
    };

    try {
      if (networkStatus.isConnected) {
        const response = await ApiService.submitOrder(order);

        if (response.success) {
          setCurrentOrder([]);
          showToast("success", "Order submitted successfully!");
        } else {
          showToast(
            "error",
            `Order submission failed: ${response.message || "Unknown error"}`,
          );
        }
      } else {
        await addOfflineOrder(order);
        setCurrentOrder([]);
        showToast("info", "Order saved offline. Will submit when online.");
      }
    } catch (error) {
      console.error("Error submitting order:", error);
      showToast("error", "Failed to submit order. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Process queue when network connection is restored
  useEffect(() => {
    if (networkStatus.isConnected && offlineOrders.length > 0) {
      processOfflineOrders();
    }
  }, [networkStatus.isConnected, offlineOrders.length, processOfflineOrders]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Section */}
      <HeaderSection networkStatus={networkStatus} />

      {/* Offline Queue Status */}
      <View className="px-4">
        <OfflineQueueStatus
          queueStats={queueStats}
          isProcessing={isProcessing}
        />
      </View>

      {/* Drink Menu */}
      <DrinkMenu
        drinks={drinks}
        onDrinkPress={handleDrinkPress}
        refreshing={refreshing}
        onRefresh={fetchDrinks}
      />

      {/* Order Summary - Always at bottom */}
      <OrderSummary
        orderItems={currentOrder}
        isSubmitting={isSubmitting}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onSubmitOrder={handleSubmitOrder}
        onClearOrder={handleClearOrder}
      />

      {/* Size Selection Modal - Now rendered last to ensure proper z-index */}
      <SizeSelectionModal
        visible={showSizeModal}
        drink={selectedDrink}
        selectedSize={selectedSize}
        quantity={quantity}
        onSizeSelect={handleSizeSelect}
        onQuantityChange={handleQuantityChange}
        onClose={() => setShowSizeModal(false)}
        onAddToOrder={handleAddToOrder}
      />
    </SafeAreaView>
  );
};

export default DrinkSelectionScreen;
