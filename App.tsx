import "react-native-get-random-values";
import "./global.css";
import React, { useEffect, useCallback } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { StatusBar } from "expo-status-bar";
import { AppState, AppStateStatus } from "react-native";
import Toast, {
  BaseToast,
  ErrorToast,
  InfoToast,
} from "react-native-toast-message";
import DrinkSelectionScreen from "@/screens/DrinkSelectionScreen";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { OfflineQueueService } from "@/services/offlineQueue";

const Stack = createStackNavigator();

// Custom Toast Configuration
const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#10b981",
        backgroundColor: "#f0fdf4",
        borderWidth: 1,
        borderColor: "#bbf7d0",
      }}
      contentContainerStyle={{ paddingHorizontal: 15 }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#065f46",
      }}
      text2Style={{
        fontSize: 14,
        color: "#047857",
      }}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={{
        borderLeftColor: "#ef4444",
        backgroundColor: "#fef2f2",
        borderWidth: 1,
        borderColor: "#fecaca",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#991b1b",
      }}
      text2Style={{
        fontSize: 14,
        color: "#dc2626",
      }}
    />
  ),
  info: (props: any) => (
    <InfoToast
      {...props}
      style={{
        borderLeftColor: "#f59e0b",
        backgroundColor: "#fffbeb",
        borderWidth: 1,
        borderColor: "#fed7aa",
      }}
      text1Style={{
        fontSize: 16,
        fontWeight: "600",
        color: "#92400e",
      }}
      text2Style={{
        fontSize: 14,
        color: "#d97706",
      }}
    />
  ),
};

const App: React.FC = () => {
  const networkStatus = useNetworkStatus();

  // Handle app state changes
  const handleAppStateChange = useCallback(
    (nextAppState: AppStateStatus) => {
      if (nextAppState === "active") {
        console.log("📱 App became active");

        // Refresh network status when app becomes active
        networkStatus.refreshNetworkStatus();

        // Process offline orders if connected
        if (networkStatus.isConnected) {
          console.log("🔄 App active: Processing offline orders...");
          setTimeout(() => {
            OfflineQueueService.processOfflineOrders();
          }, 1000); // Small delay to ensure network is stable
        }
      } else if (nextAppState === "background") {
        console.log("📱 App went to background");
      }
    },
    [networkStatus],
  );

  // Setup app lifecycle listeners
  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      handleAppStateChange,
    );
    return () => subscription?.remove();
  }, [handleAppStateChange]);

  // Auto-process offline orders when network comes back online
  useEffect(() => {
    if (networkStatus.isConnected) {
      console.log("🌐 Network connected: Auto-processing offline orders...");

      // Add delay to ensure network is stable
      const timeoutId = setTimeout(() => {
        OfflineQueueService.processOfflineOrders().then((result) => {
          if (result.processed > 0) {
            Toast.show({
              type: "success",
              text1: "Orders Synced! 🔄",
              text2: `${result.successful} orders submitted successfully`,
              visibilityTime: 3000,
            });
          }
        });
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [networkStatus.isConnected]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      console.log("🧹 App cleanup: Clearing retry timeouts...");
      OfflineQueueService.clearAllRetries();
    };
  }, []);

  // Show network status changes
  useEffect(() => {
    if (networkStatus.isConnected) {
      Toast.show({
        type: "success",
        text1: "Back Online! 🟢",
        text2: "Connection restored",
        visibilityTime: 2000,
      });
    } else {
      Toast.show({
        type: "error",
        text1: "Gone Offline 🔴",
        text2: "Orders will be saved locally",
        visibilityTime: 3000,
      });
    }
  }, [networkStatus.isConnected]);

  return (
    <>
      <StatusBar style="dark" backgroundColor="#f9fafb" />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: ({ current, layouts }) => {
              return {
                cardStyle: {
                  transform: [
                    {
                      translateX: current.progress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [layouts.screen.width, 0],
                      }),
                    },
                  ],
                },
              };
            },
          }}
        >
          <Stack.Screen
            name="DrinkSelection"
            component={DrinkSelectionScreen}
          />
          {/* Add more screens here in the future */}
        </Stack.Navigator>
      </NavigationContainer>

      {/* Toast Messages */}
      <Toast config={toastConfig} />
    </>
  );
};

export default App;
