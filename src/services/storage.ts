import AsyncStorage from '@react-native-async-storage/async-storage';
import { Order } from '../types';
import { STORAGE_KEYS } from '../utils/constants';

export class StorageService {
    // Offline Orders Management
    static async saveOfflineOrders(orders: Order[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(orders);
            await AsyncStorage.setItem(STORAGE_KEYS.OFFLINE_ORDERS, jsonValue);
            console.log('💾 Offline orders saved:', orders.length);
        } catch (error) {
            console.error('❌ Failed to save offline orders:', error);
            throw new Error('Failed to save offline orders');
        }
    }

    static async getOfflineOrders(): Promise<Order[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.OFFLINE_ORDERS);
            if (jsonValue) {
                const orders = JSON.parse(jsonValue) as Order[];
                console.log('📖 Loaded offline orders:', orders.length);
                return orders;
            }
            return [];
        } catch (error) {
            console.error('❌ Failed to get offline orders:', error);
            return [];
        }
    }

    static async addOfflineOrder(order: Order): Promise<void> {
        try {
            const existingOrders = await this.getOfflineOrders();
            const updatedOrders = [order, ...existingOrders]; // Add to beginning
            await this.saveOfflineOrders(updatedOrders);
            console.log('➕ Added offline order:', order.id);
        } catch (error) {
            console.error('❌ Failed to add offline order:', error);
            throw error;
        }
    }

    static async removeOfflineOrder(orderId: string): Promise<void> {
        try {
            const existingOrders = await this.getOfflineOrders();
            const filteredOrders = existingOrders.filter(order => order.id !== orderId);
            await this.saveOfflineOrders(filteredOrders);
            console.log('➖ Removed offline order:', orderId);
        } catch (error) {
            console.error('❌ Failed to remove offline order:', error);
            throw error;
        }
    }

    static async updateOfflineOrder(orderId: string, updates: Partial<Order>): Promise<void> {
        try {
            const existingOrders = await this.getOfflineOrders();
            const updatedOrders = existingOrders.map(order =>
                order.id === orderId ? { ...order, ...updates } : order
            );
            await this.saveOfflineOrders(updatedOrders);
            console.log('✏️ Updated offline order:', orderId, updates);
        } catch (error) {
            console.error('❌ Failed to update offline order:', error);
            throw error;
        }
    }

    static async clearOfflineOrders(): Promise<void> {
        try {
            await AsyncStorage.removeItem(STORAGE_KEYS.OFFLINE_ORDERS);
            console.log('🧹 Cleared all offline orders');
        } catch (error) {
            console.error('❌ Failed to clear offline orders:', error);
            throw error;
        }
    }

    // Order History Management
    static async saveOrderHistory(orders: Order[]): Promise<void> {
        try {
            const jsonValue = JSON.stringify(orders);
            await AsyncStorage.setItem(STORAGE_KEYS.ORDER_HISTORY, jsonValue);
            console.log('📚 Order history saved:', orders.length);
        } catch (error) {
            console.error('❌ Failed to save order history:', error);
            throw error;
        }
    }

    static async getOrderHistory(): Promise<Order[]> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.ORDER_HISTORY);
            if (jsonValue) {
                const orders = JSON.parse(jsonValue) as Order[];
                return orders.sort((a, b) =>
                    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                );
            }
            return [];
        } catch (error) {
            console.error('❌ Failed to get order history:', error);
            return [];
        }
    }

    static async addToOrderHistory(order: Order): Promise<void> {
        try {
            const existingHistory = await this.getOrderHistory();
            const updatedHistory = [order, ...existingHistory.slice(0, 99)]; // Keep last 100 orders
            await this.saveOrderHistory(updatedHistory);
            console.log('📝 Added to order history:', order.id);
        } catch (error) {
            console.error('❌ Failed to add to order history:', error);
            throw error;
        }
    }

    // App Settings Management
    static async saveAppSettings(settings: Record<string, any>): Promise<void> {
        try {
            const jsonValue = JSON.stringify(settings);
            await AsyncStorage.setItem(STORAGE_KEYS.APP_SETTINGS, jsonValue);
            console.log('⚙️ App settings saved');
        } catch (error) {
            console.error('❌ Failed to save app settings:', error);
            throw error;
        }
    }

    static async getAppSettings(): Promise<Record<string, any>> {
        try {
            const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.APP_SETTINGS);
            return jsonValue ? JSON.parse(jsonValue) : {};
        } catch (error) {
            console.error('❌ Failed to get app settings:', error);
            return {};
        }
    }

    // Utility Methods
    static async clearAllData(): Promise<void> {
        try {
            await AsyncStorage.multiRemove([
                STORAGE_KEYS.OFFLINE_ORDERS,
                STORAGE_KEYS.ORDER_HISTORY,
                STORAGE_KEYS.APP_SETTINGS,
            ]);
            console.log('🗑️ All app data cleared');
        } catch (error) {
            console.error('❌ Failed to clear all data:', error);
            throw error;
        }
    }

    static async getStorageInfo(): Promise<{
        offlineOrdersCount: number;
        orderHistoryCount: number;
        hasSettings: boolean;
    }> {
        try {
            const [offlineOrders, orderHistory, settings] = await Promise.all([
                this.getOfflineOrders(),
                this.getOrderHistory(),
                this.getAppSettings(),
            ]);

            return {
                offlineOrdersCount: offlineOrders.length,
                orderHistoryCount: orderHistory.length,
                hasSettings: Object.keys(settings).length > 0,
            };
        } catch (error) {
            console.error('❌ Failed to get storage info:', error);
            return {
                offlineOrdersCount: 0,
                orderHistoryCount: 0,
                hasSettings: false,
            };
        }
    }
}
