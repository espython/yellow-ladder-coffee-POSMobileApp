import Constants from "expo-constants";
import { DrinkItem, DrinkSize } from "../types";

// API Configuration
const getApiBaseUrl = () => {
  if (__DEV__) {
    // For Expo development - automatically detect your computer's IP
    const debuggerHost = Constants.expoConfig?.hostUri?.split(":")[0];
    if (debuggerHost) {
      return `http://${debuggerHost}:3000/api`;
    }
    // Fallback - replace with your actual computer's IP address
    return "http://192.168.1.100:3000/api";
  }
  // Production API URL
  return "https://your-production-api.com/api";
};

export const API_BASE_URL = getApiBaseUrl();

// Storage Keys
export const STORAGE_KEYS = {
  OFFLINE_ORDERS: "@pos_offline_orders",
  ORDER_HISTORY: "@pos_order_history",
  APP_SETTINGS: "@pos_app_settings",
} as const;

// Retry Configuration
export const RETRY_CONFIG = {
  MAX_RETRIES: 3,
  INITIAL_DELAY: 1000, // 1 second
  MAX_DELAY: 10000, // 10 seconds
  BACKOFF_FACTOR: 2,
};

// App Configuration
export const APP_CONFIG = {
  NETWORK_CHECK_INTERVAL: 3000, // 3 seconds
  TOAST_DURATION: 3000, // 3 seconds
  ORDER_SYNC_DELAY: 2000, // 2 seconds
};

// Drinks Menu Data
export const DRINKS_DATA: DrinkItem[] = [
  {
    id: "1",
    name: "Espresso",
    description: "Rich and bold single shot of pure coffee",
    category: "coffee",
    emoji: "☕",
    popular: true,
    sizes: [
      { size: "small", price: 2.5, volume: "1 oz" },
      { size: "medium", price: 3.0, volume: "2 oz" },
      { size: "large", price: 3.5, volume: "3 oz" },
    ],
  },
  {
    id: "2",
    name: "Latte",
    description: "Smooth espresso with steamed milk and light foam",
    category: "coffee",
    emoji: "🥛",
    popular: true,
    sizes: [
      { size: "small", price: 4.0, volume: "8 oz" },
      { size: "medium", price: 4.5, volume: "12 oz" },
      { size: "large", price: 5.0, volume: "16 oz" },
    ],
  },
  {
    id: "3",
    name: "Iced Americano",
    description: "Espresso shots with cold water served over ice",
    category: "cold",
    emoji: "🧊",
    popular: false,
    sizes: [
      { size: "small", price: 3.0, volume: "12 oz" },
      { size: "medium", price: 3.5, volume: "16 oz" },
      { size: "large", price: 4.0, volume: "20 oz" },
    ],
  },
  {
    id: "4",
    name: "Cappuccino",
    description: "Equal parts espresso, steamed milk, and foam",
    category: "coffee",
    emoji: "☕",
    sizes: [
      { size: "small", price: 3.5, volume: "6 oz" },
      { size: "medium", price: 4.0, volume: "8 oz" },
      { size: "large", price: 4.5, volume: "10 oz" },
    ],
  },
  {
    id: "5",
    name: "Cold Brew",
    description: "Smooth, less acidic coffee brewed cold for 12 hours",
    category: "cold",
    emoji: "🥤",
    sizes: [
      { size: "small", price: 3.25, volume: "12 oz" },
      { size: "medium", price: 3.75, volume: "16 oz" },
      { size: "large", price: 4.25, volume: "20 oz" },
    ],
  },
  {
    id: "6",
    name: "Macchiato",
    description: "Espresso marked with a dollop of steamed milk foam",
    category: "coffee",
    emoji: "☕",
    sizes: [
      { size: "small", price: 3.75, volume: "4 oz" },
      { size: "medium", price: 4.25, volume: "6 oz" },
      { size: "large", price: 4.75, volume: "8 oz" },
    ],
  },
  {
    id: "7",
    name: "Frappuccino",
    description: "Blended iced coffee drink with whipped cream",
    category: "cold",
    emoji: "🥤",
    popular: true,
    sizes: [
      { size: "small", price: 4.5, volume: "12 oz" },
      { size: "medium", price: 5.0, volume: "16 oz" },
      { size: "large", price: 5.5, volume: "20 oz" },
    ],
  },
  {
    id: "8",
    name: "Green Tea Latte",
    description: "Matcha green tea with steamed milk",
    category: "tea",
    emoji: "🍵",
    sizes: [
      { size: "small", price: 4.25, volume: "8 oz" },
      { size: "medium", price: 4.75, volume: "12 oz" },
      { size: "large", price: 5.25, volume: "16 oz" },
    ],
  },
];

// Helper Functions
export const formatPrice = (price: number): string => {
  return `$${price.toFixed(2)}`;
};

export const formatTimestamp = (timestamp: string): string => {
  return new Date(timestamp).toLocaleString();
};

export const getLowestPrice = (sizes: DrinkSize[]): number => {
  return Math.min(...sizes.map((size) => size.price));
};

export const getCategoryColor = (category: string) => {
  switch (category) {
    case "coffee":
      return {
        border: "border-coffee-300",
        background: "bg-coffee-50",
        text: "text-coffee-700",
      };
    case "cold":
      return {
        border: "border-blue-300",
        background: "bg-blue-50",
        text: "text-blue-700",
      };
    case "tea":
      return {
        border: "border-green-300",
        background: "bg-green-50",
        text: "text-green-700",
      };
    case "specialty":
      return {
        border: "border-purple-300",
        background: "bg-purple-50",
        text: "text-purple-700",
      };
    default:
      return {
        border: "border-gray-300",
        background: "bg-gray-50",
        text: "text-gray-700",
      };
  }
};
