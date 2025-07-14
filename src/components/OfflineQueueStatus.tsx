import React from "react";
import { View, Text } from "react-native";
import { LoadingSpinner } from "./LoadingSpinner";

interface OfflineQueueStatusProps {
  queueStats: {
    total: number;
    failed: number;
    pending: number;
  };
  isProcessing: boolean;
}

export const OfflineQueueStatus: React.FC<OfflineQueueStatusProps> = ({
  queueStats,
  isProcessing,
}) => {
  if (queueStats.total === 0) return null;

  return (
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
  );
};

export default OfflineQueueStatus;
