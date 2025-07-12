export interface DrinkItem {
    id: string;
    name: string;
    description: string;
    sizes: DrinkSize[];
    category: 'coffee' | 'tea' | 'cold' | 'specialty';
    emoji: string;
    popular?: boolean;
}

export interface DrinkSize {
    size: 'small' | 'medium' | 'large';
    price: number;
    volume: string;
}

export interface OrderItem {
    id: string;
    drinkId: string;
    name: string;
    size: 'small' | 'medium' | 'large';
    price: number;
    quantity: number;
    emoji: string;
}

export interface Order {
    id: string;
    items: OrderItem[];
    totalPrice: number;
    timestamp: string;
    status: 'pending' | 'submitted' | 'failed';
    isOffline?: boolean;
    retryCount?: number;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    message: string;
    orderId?: string;
    timestamp?: string;
}

export interface NetworkStatus {
    isConnected: boolean;
    isInternetReachable: boolean;
    type: string;
}

export interface CreateOrderRequest {
    items: {
        name: string;
        size: string;
        price: number;
        quantity: number;
    }[];
}

export interface CreateOrderResponse {
    success: boolean;
    orderId: string;
    timestamp: string;
    message: string;
}
