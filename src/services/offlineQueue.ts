import { Order } from '../types';
import { StorageService } from './storage';
import { ApiService } from './api';
import { RETRY_CONFIG, APP_CONFIG } from '../utils/constants';

export class OfflineQueueService {
    private static retryTimeouts: Map<string, NodeJS.Timeout> = new Map();
    private static isProcessing = false;

    // Process all offline orders
    static async processOfflineOrders(): Promise<{
        processed: number;
        successful: number;
        failed: number;
    }> {
        if (this.isProcessing) {
            console.log('⏳ Already processing offline orders...');
            return { processed: 0, successful: 0, failed: 0 };
        }

        this.isProcessing = true;
        let processed = 0;
        let successful = 0;
        let failed = 0;

        try {
            const offlineOrders = await StorageService.getOfflineOrders();

            if (offlineOrders.length === 0) {
                console.log('📭 No offline orders to process');
                return { processed: 0, successful: 0, failed: 0 };
            }

            console.log(`🔄 Processing ${offlineOrders.length} offline orders...`);

            // Process orders sequentially to avoid overwhelming the server
            for (const order of offlineOrders) {
                processed++;
                const result = await this.processOrder(order);
                if (result) {
                    successful++;
                } else {
                    failed++;
                }

                // Small delay between orders
                await new Promise(resolve => setTimeout(resolve, 500));
            }

            console.log(`✅ Offline orders processed: ${successful} successful, ${failed} failed`);

        } catch (error) {
            console.error('❌ Failed to process offline orders:', error);
        } finally {
            this.isProcessing = false;
        }

        return { processed, successful, failed };
    }

    // Process a single order
    private static async processOrder(order: Order): Promise<boolean> {
        try {
            console.log(`🔄 Processing order: ${order.id}`);

            const response = await ApiService.submitOrder(order);

            if (response.success) {
                // Order submitted successfully
                await StorageService.removeOfflineOrder(order.id);

                // Add to order history
                const updatedOrder: Order = {
                    ...order,
                    status: 'submitted',
                    isOffline: false,
                };
                await StorageService.addToOrderHistory(updatedOrder);

                console.log(`✅ Order ${order.id} submitted successfully`);

                // Clear any existing retry timeout
                this.clearRetryTimeout(order.id);

                return true;
            } else {
                // Submission failed, schedule retry
                console.log(`❌ Order ${order.id} submission failed: ${response.message}`);
                await this.scheduleRetry(order, response.message);
                return false;
            }
        } catch (error) {
            console.error(`❌ Error processing order ${order.id}:`, error);
            await this.scheduleRetry(order, error instanceof Error ? error.message : 'Unknown error');
            return false;
        }
    }

    // Schedule retry for failed order
    private static async scheduleRetry(order: Order, errorMessage: string): Promise<void> {
        const retryCount = (order.retryCount || 0) + 1;

        if (retryCount > RETRY_CONFIG.MAX_RETRIES) {
            console.log(`💀 Order ${order.id} exceeded max retries (${RETRY_CONFIG.MAX_RETRIES}), marking as failed`);

            // Update order status to failed
            await StorageService.updateOfflineOrder(order.id, {
                status: 'failed',
                retryCount,
            });

            return;
        }

        // Calculate delay with exponential backoff
        const delay = Math.min(
            RETRY_CONFIG.INITIAL_DELAY * Math.pow(RETRY_CONFIG.BACKOFF_FACTOR, retryCount - 1),
            RETRY_CONFIG.MAX_DELAY
        );

        console.log(`⏰ Scheduling retry ${retryCount}/${RETRY_CONFIG.MAX_RETRIES} for order ${order.id} in ${delay}ms`);

        // Update retry count in storage
        await StorageService.updateOfflineOrder(order.id, {
            retryCount,
        });

        // Schedule retry
        const timeoutId = setTimeout(async () => {
            console.log(`🔄 Retrying order ${order.id} (attempt ${retryCount})`);
            await this.processOrder(order);
        }, delay);

        // Store timeout reference
        this.retryTimeouts.set(order.id, timeoutId);
    }

    // Clear retry timeout for specific order
    private static clearRetryTimeout(orderId: string): void {
        const timeoutId = this.retryTimeouts.get(orderId);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.retryTimeouts.delete(orderId);
            console.log(`🧹 Cleared retry timeout for order: ${orderId}`);
        }
    }

    // Clear all retry timeouts
    static clearAllRetries(): void {
        console.log(`🧹 Clearing ${this.retryTimeouts.size} retry timeouts`);
        this.retryTimeouts.forEach(timeoutId => clearTimeout(timeoutId));
        this.retryTimeouts.clear();
    }

    // Get processing status
    static getProcessingStatus(): {
        isProcessing: boolean;
        pendingRetries: number;
    } {
        return {
            isProcessing: this.isProcessing,
            pendingRetries: this.retryTimeouts.size,
        };
    }

    // Force retry all failed orders
    static async retryFailedOrders(): Promise<void> {
        try {
            const offlineOrders = await StorageService.getOfflineOrders();
            const failedOrders = offlineOrders.filter(order => order.status === 'failed');

            if (failedOrders.length === 0) {
                console.log('📭 No failed orders to retry');
                return;
            }

            console.log(`🔄 Force retrying ${failedOrders.length} failed orders`);

            // Reset failed orders to pending and clear retry count
            for (const order of failedOrders) {
                await StorageService.updateOfflineOrder(order.id, {
                    status: 'pending',
                    retryCount: 0,
                });
            }

            // Process orders
            await this.processOfflineOrders();

        } catch (error) {
            console.error('❌ Failed to retry failed orders:', error);
        }
    }

    // Get queue statistics
    static async getQueueStats(): Promise<{
        total: number;
        pending: number;
        failed: number;
        oldestOrder?: string;
    }> {
        try {
            const offlineOrders = await StorageService.getOfflineOrders();

            const pending = offlineOrders.filter(order => order.status === 'pending').length;
            const failed = offlineOrders.filter(order => order.status === 'failed').length;

            const oldestOrder = offlineOrders.length > 0
                ? offlineOrders.reduce((oldest, current) =>
                    new Date(current.timestamp) < new Date(oldest.timestamp) ? current : oldest
                ).timestamp
                : undefined;

            return {
                total: offlineOrders.length,
                pending,
                failed,
                oldestOrder,
            };
        } catch (error) {
            console.error('❌ Failed to get queue stats:', error);
            return {
                total: 0,
                pending: 0,
                failed: 0,
            };
        }
    }
}
