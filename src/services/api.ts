import { Order, ApiResponse, CreateOrderRequest, CreateOrderResponse } from '../types';
import { API_BASE_URL } from '../utils/constants';

export class ApiService {
    private static timeout = 10000; // 10 seconds timeout

    private static async makeRequest<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<ApiResponse<T>> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const url = `${API_BASE_URL}${endpoint}`;
            console.log('🌐 API Request:', url, options.method || 'GET');

            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    ...options.headers,
                },
                signal: controller.signal,
                ...options,
            });

            clearTimeout(timeoutId);

            // Parse response
            let data;
            const contentType = response.headers.get('content-type');
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }

            console.log('📡 API Response:', response.status, data);

            if (!response.ok) {
                const errorMessage = data?.message || data || `HTTP error! status: ${response.status}`;
                throw new Error(errorMessage);
            }

            return {
                success: true,
                data,
                message: data?.message || 'Success',
                orderId: data?.orderId,
                timestamp: data?.timestamp,
            };
        } catch (error) {
            clearTimeout(timeoutId);

            if (error instanceof Error) {
                if (error.name === 'AbortError') {
                    console.error('⏰ API request timeout:', endpoint);
                    return {
                        success: false,
                        message: 'Request timeout - please check your connection',
                    };
                }

                console.error('❌ API request failed:', error.message);
                return {
                    success: false,
                    message: error.message,
                };
            }

            console.error('❌ Unknown API error:', error);
            return {
                success: false,
                message: 'An unexpected error occurred',
            };
        }
    }

    // Submit Order
    static async submitOrder(order: Order): Promise<ApiResponse<CreateOrderResponse>> {
        const orderPayload: CreateOrderRequest = {
            items: order.items.map(item => ({
                name: item.name,
                size: item.size,
                price: item.price,
                quantity: item.quantity,
            })),
        };

        console.log('📤 Submitting order:', order.id, orderPayload);

        return this.makeRequest<CreateOrderResponse>('/orders', {
            method: 'POST',
            body: JSON.stringify(orderPayload),
        });
    }

    // Health Check
    static async checkHealth(): Promise<ApiResponse> {
        return this.makeRequest('/health');
    }

    // Test Connection
    static async testConnection(): Promise<boolean> {
        try {
            const response = await this.checkHealth();
            return response.success;
        } catch (error) {
            console.error('🔌 Connection test failed:', error);
            return false;
        }
    }

    // Get Order Status (for future use)
    static async getOrderStatus(orderId: string): Promise<ApiResponse> {
        return this.makeRequest(`/orders/${orderId}`);
    }

    // Get Orders History (for future use)
    static async getOrdersHistory(limit: number = 50): Promise<ApiResponse> {
        return this.makeRequest(`/orders?limit=${limit}`);
    }

    // Update API timeout
    static setTimeout(ms: number): void {
        this.timeout = ms;
        console.log('⏱️ API timeout updated to:', ms, 'ms');
    }
}
