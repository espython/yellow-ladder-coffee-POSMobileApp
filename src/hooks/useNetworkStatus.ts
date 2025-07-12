import { useState, useEffect, useCallback } from 'react';
import * as Network from 'expo-network';
import { NetworkStatus } from '../types';
import { APP_CONFIG } from '../utils/constants';

export const useNetworkStatus = () => {
    const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
        isConnected: true,
        isInternetReachable: true,
        type: 'unknown',
    });

    const [isChecking, setIsChecking] = useState(false);

    const checkNetworkStatus = useCallback(async () => {
        if (isChecking) return;

        setIsChecking(true);
        try {
            const networkState = await Network.getNetworkStateAsync();

            const newStatus: NetworkStatus = {
                isConnected: networkState.isConnected ?? false,
                isInternetReachable: networkState.isInternetReachable ?? false,
                type: networkState.type?.toString() || 'unknown',
            };

            // Only update if status actually changed to prevent unnecessary re-renders
            setNetworkStatus(prevStatus => {
                if (
                    prevStatus.isConnected !== newStatus.isConnected ||
                    prevStatus.isInternetReachable !== newStatus.isInternetReachable ||
                    prevStatus.type !== newStatus.type
                ) {
                    console.log('📡 Network status changed:', newStatus);
                    return newStatus;
                }
                return prevStatus;
            });
        } catch (error) {
            console.error('❌ Error checking network status:', error);
            setNetworkStatus({
                isConnected: false,
                isInternetReachable: false,
                type: 'unknown',
            });
        } finally {
            setIsChecking(false);
        }
    }, [isChecking]);

    useEffect(() => {
        let intervalId: NodeJS.Timeout;

        // Initial check
        checkNetworkStatus();

        // Set up polling interval
        intervalId = setInterval(checkNetworkStatus, APP_CONFIG.NETWORK_CHECK_INTERVAL);

        return () => {
            if (intervalId) {
                clearInterval(intervalId);
            }
        };
    }, [checkNetworkStatus]);

    // Manual refresh function
    const refreshNetworkStatus = useCallback(() => {
        checkNetworkStatus();
    }, [checkNetworkStatus]);

    return {
        ...networkStatus,
        refreshNetworkStatus,
        isChecking,
    };
};
