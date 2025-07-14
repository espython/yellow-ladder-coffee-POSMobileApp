import React from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "./Button";
import { formatPrice } from "@/utils/constants";
import type { DrinkItem, DrinkSize } from "@/types";

interface SizeSelectionModalProps {
  visible: boolean;
  drink: DrinkItem | null;
  selectedSize: DrinkSize | null | undefined;
  quantity: number;
  onSizeSelect: (size: DrinkSize) => void;
  onQuantityChange: (change: number) => void;
  onClose: () => void;
  onAddToOrder: () => void;
}

export const SizeSelectionModal: React.FC<SizeSelectionModalProps> = ({
  visible,
  drink,
  selectedSize,
  quantity,
  onSizeSelect,
  onQuantityChange,
  onClose,
  onAddToOrder,
}) => {
  const insets = useSafeAreaInsets();

  if (!drink) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/40">
        <View
          className="bg-white rounded-t-3xl p-6"
          style={{ paddingBottom: Math.max(insets.bottom + 16, 24) }}
        >
          {/* Drink Info */}
          <View className="items-center pb-4">
            <Text className="text-3xl mb-1">{drink.emoji}</Text>
            <Text className="text-2xl font-bold text-gray-800">
              {drink.name}
            </Text>
            <Text className="text-gray-600 text-center mt-1">
              {drink.description}
            </Text>
          </View>

          {/* Size Selection */}
          <Text className="text-lg font-semibold text-gray-800 mb-3">Size</Text>
          <View className="flex-row justify-between space-x-3 mb-5">
            {drink.sizes.map((size) => (
              <TouchableOpacity
                key={size.size}
                onPress={() => onSizeSelect(size)}
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
                  <Text className="text-gray-600 text-sm">{size.volume}</Text>
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
              onPress={() => onQuantityChange(-1)}
              className="w-12 h-12 bg-gray-200 rounded-full items-center justify-center"
            >
              <Text className="text-xl font-bold text-gray-700">−</Text>
            </TouchableOpacity>
            <Text className="mx-6 text-2xl font-bold text-gray-800">
              {quantity}
            </Text>
            <TouchableOpacity
              onPress={() => onQuantityChange(1)}
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
                  {quantity}x {drink.name} ({selectedSize.size})
                </Text>
                <Text className="font-bold text-lg text-primary-600">
                  {formatPrice(selectedSize.price * quantity)}
                </Text>
              </View>
            </View>
          )}

          {/* Action Buttons */}
          <View className="flex-row justify-center gap-3">
            <Button
              title="Cancel"
              onPress={onClose}
              variant="outline"
              size="lg"
              className="w-[50%]"
            />
            <Button
              title={`Add ${quantity} to Order`}
              onPress={onAddToOrder}
              size="lg"
              className="w-[50%]"
              disabled={!selectedSize}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default SizeSelectionModal;
