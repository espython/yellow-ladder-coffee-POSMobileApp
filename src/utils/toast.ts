import { ToastAndroid, Platform, Alert } from "react-native";

/**
 * Toast notification types
 */
type ToastType = "success" | "error" | "info" | "warning";

/**
 * Shows a toast notification with the specified type and message
 * Uses native ToastAndroid on Android and Alert on iOS
 *
 * @param type The type of toast notification (success, error, info, warning)
 * @param message The message to display in the toast
 * @param duration Optional duration in milliseconds (Android only)
 */
export const showToast = (
  type: ToastType,
  message: string,
  duration: number = 2000,
): void => {
  // Handle based on platform
  if (Platform.OS === "android") {
    ToastAndroid.show(
      message,
      duration > 3000 ? ToastAndroid.LONG : ToastAndroid.SHORT,
    );
  } else {
    // On iOS, use Alert since there's no native Toast
    let title = "";

    switch (type) {
      case "success":
        title = "Success";
        break;
      case "error":
        title = "Error";
        break;
      case "warning":
        title = "Warning";
        break;
      case "info":
      default:
        title = "Information";
        break;
    }

    Alert.alert(title, message);
  }
};
