import React, { useEffect, useRef } from "react";
import { View, Text, Animated } from "react-native";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { useOfflineQueue } from "@/hooks/useOfflineQueue";

export const OfflineIndicator: React.FC = () => {
  const networkStatus = useNetworkStatus();
  const { queueStats } = useOfflineQueue();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (!networkStatus.isConnected) {
      // Show indicator
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Hide indicator
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -100,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [networkStatus.isConnected, fadeAnim, slideAnim]);

  if (networkStatus.isConnected) {
    return null;
  }

  return (
    <Animated.View
      style={{
        opacity: fadeAnim,
        transform: [{ translateY: slideAnim }],
      }}
      className="absolute top-0 left-0 right-0 z-50 bg-error-500 px-4 py-3 shadow-lg"
    >
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center flex-1">
          <Text className="text-2xl mr-2">📵</Text>
          <View className="flex-1">
            <Text className="text-white font-semibold text-sm">
              No Internet Connection
            </Text>
            <Text className="text-white/90 text-xs">
              Orders will be saved offline and synced when connection is
              restored
            </Text>
          </View>
        </View>

        {queueStats.total > 0 && (
          <View className="bg-white/20 px-2 py-1 rounded-full ml-2">
            <Text className="text-white text-xs font-bold">
              {queueStats.total}
            </Text>
          </View>
        )}
      </View>
    </Animated.View>
  );
};
