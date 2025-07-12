import { useState, useEffect, useCallback } from "react";
import { Order } from "../types";
import { StorageService } from "../services/storage";
import { OfflineQueueService } from "../services/offlineQueue";
import { useNetworkStatus } from "./useNetworkStatus";
import { APP_CONFIG } from "../utils/constants";

interface OfflineQueueState {
  offlineOrders: Order[];
  isProcessing: boolean;
  queueStats: {
    total: number;
    pending: number;
    failed: number;
    oldestOrder?: string;
  };
}

export const useOfflineQueue = () => {
  const [state, setState] = useState<OfflineQueueState>({
    offlineOrders: [],
    isProcessing: false,
    queueStats: {
      total: 0,
      pending: 0,
      failed: 0,
    },
  });

  const networkStatus = useNetworkStatus();

  // Load offline orders from storage
  const loadOfflineOrders = useCallback(async () => {
    try {
      const [orders, stats] = await Promise.all([
        StorageService.getOfflineOrders(),
        OfflineQueueService.getQueueStats(),
      ]);

      setState((prevState) => ({
        ...prevState,
        offlineOrders: orders,
        queueStats: stats,
      }));

      console.log("📖 Loaded offline orders:", orders.length);
    } catch (error) {
      console.error("❌ Failed to load offline orders:", error);
    }
  }, []);

  // Add new offline order
  const addOfflineOrder = useCallback(
    async (order: Order): Promise<void> => {
      try {
        await StorageService.addOfflineOrder(order);
        await loadOfflineOrders(); // Refresh the list
        console.log("➕ Added offline order:", order.id);
      } catch (error) {
        console.error("❌ Failed to add offline order:", error);
        throw error;
      }
    },
    [loadOfflineOrders],
  );

  // Process offline orders
  const processOfflineOrders = useCallback(async (): Promise<{
    processed: number;
    successful: number;
    failed: number;
  }> => {
    if (!networkStatus.isConnected || state.isProcessing) {
      console.log(
        "⏸️ Cannot process orders: network disconnected or already processing",
      );
      return { processed: 0, successful: 0, failed: 0 };
    }

    setState((prevState) => ({ ...prevState, isProcessing: true }));

    try {
      const result = await OfflineQueueService.processOfflineOrders();
      await loadOfflineOrders(); // Refresh the list
      return result;
    } catch (error) {
      console.error("❌ Failed to process offline orders:", error);
      return { processed: 0, successful: 0, failed: 0 };
    } finally {
      setState((prevState) => ({ ...prevState, isProcessing: false }));
    }
  }, [networkStatus.isConnected, state.isProcessing, loadOfflineOrders]);

  // Retry failed orders
  const retryFailedOrders = useCallback(async (): Promise<void> => {
    if (!networkStatus.isConnected) {
      console.log("⏸️ Cannot retry orders: network disconnected");
      return;
    }

    setState((prevState) => ({ ...prevState, isProcessing: true }));

    try {
      await OfflineQueueService.retryFailedOrders();
      await loadOfflineOrders(); // Refresh the list
    } catch (error) {
      console.error("❌ Failed to retry failed orders:", error);
    } finally {
      setState((prevState) => ({ ...prevState, isProcessing: false }));
    }
  }, [networkStatus.isConnected, loadOfflineOrders]);

  // Clear all offline orders
  const clearOfflineOrders = useCallback(async (): Promise<void> => {
    try {
      await StorageService.clearOfflineOrders();
      OfflineQueueService.clearAllRetries();
      await loadOfflineOrders(); // Refresh the list
      console.log("🧹 Cleared all offline orders");
    } catch (error) {
      console.error("❌ Failed to clear offline orders:", error);
      throw error;
    }
  }, [loadOfflineOrders]);

  // Remove specific offline order
  const removeOfflineOrder = useCallback(
    async (orderId: string): Promise<void> => {
      try {
        await StorageService.removeOfflineOrder(orderId);
        await loadOfflineOrders(); // Refresh the list
        console.log("➖ Removed offline order:", orderId);
      } catch (error) {
        console.error("❌ Failed to remove offline order:", error);
        throw error;
      }
    },
    [loadOfflineOrders],
  );

  // Load offline orders on mount
  useEffect(() => {
    loadOfflineOrders();
  }, [loadOfflineOrders]);

  // Auto-process offline orders when network comes back online
  useEffect(() => {
    if (
      networkStatus.isConnected &&
      state.offlineOrders.length > 0 &&
      !state.isProcessing
    ) {
      console.log("🔄 Network restored, auto-processing offline orders...");

      // Add a small delay to ensure network is stable
      const timeoutId = setTimeout(() => {
        processOfflineOrders();
      }, APP_CONFIG.ORDER_SYNC_DELAY);

      return () => clearTimeout(timeoutId);
    }
  }, [
    networkStatus.isConnected,
    state.offlineOrders.length,
    state.isProcessing,
    processOfflineOrders,
  ]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      OfflineQueueService.clearAllRetries();
    };
  }, []);

  return {
    // State
    offlineOrders: state.offlineOrders,
    isProcessing: state.isProcessing,
    queueStats: state.queueStats,

    // Actions
    addOfflineOrder,
    processOfflineOrders,
    retryFailedOrders,
    clearOfflineOrders,
    removeOfflineOrder,
    loadOfflineOrders,

    // Computed values
    hasOfflineOrders: state.offlineOrders.length > 0,
    hasPendingOrders: state.queueStats.pending > 0,
    hasFailedOrders: state.queueStats.failed > 0,
  };
};
