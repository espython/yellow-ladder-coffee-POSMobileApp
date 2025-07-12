import uuid from "react-native-uuid";

// Generate a random UUID v4
export const generateUUID = (): string => {
  return uuid.v4() as string;
};

// Generate a shorter ID for display purposes
export const generateShortId = (): string => {
  return generateUUID().split("-")[0] as string;
};

// Generate a timestamp-based ID
export const generateTimestampId = (): string => {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 8);
  return `${timestamp}-${randomPart}`;
};

// Validate UUID format
export const isValidUUID = (id: string): boolean => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};
