import React from 'react';
import {TouchableOpacity, Text, ActivityIndicator, View, ViewStyle, TextStyle} from 'react-native';

interface ButtonProps {
    title: string;
    onPress: () => void;
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'success';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
    icon?: React.ReactNode;
    className?: string;
    fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({


                                                  title,
                                                  onPress,
                                                  variant = 'primary',
                                                  size = 'md',
                                                  disabled = false,
                                                  loading = false,
                                                  icon,
                                                  className = '',
                                                  fullWidth = false,
                                              }) => {
    const getVariantStyles = (): string => {
        const baseStyles = 'active:scale-95 transition-transform';

        switch (variant) {
            case 'primary':
                return `${baseStyles} bg-primary-500 active:bg-primary-600 shadow-lg shadow-primary-500/25`;
            case 'secondary':
                return `${baseStyles} bg-coffee-400 active:bg-coffee-500 shadow-lg shadow-coffee-400/25`;
            case 'outline':
                return `${baseStyles} border-2 border-primary-500 bg-transparent active:bg-primary-50`;
            case 'danger':
                return `${baseStyles} bg-error-500 active:bg-error-600 shadow-lg shadow-error-500/25`;
            case 'success':
                return `${baseStyles} bg-success-500 active:bg-success-600 shadow-lg shadow-success-500/25`;
            default:
                return `${baseStyles} bg-primary-500 active:bg-primary-600 shadow-lg shadow-primary-500/25`;
        }
    };

    const getSizeStyles = (): string => {
        switch (size) {
            case 'sm':
                return 'px-3 py-2 rounded-lg';
            case 'md':
                return 'px-4 py-3 rounded-xl';
            case 'lg':
                return 'px-6 py-4 rounded-xl';
            default:
                return 'px-4 py-3 rounded-xl';
        }
    };

    const getTextStyles = (): string => {
        const baseStyles = 'font-semibold text-center';
        const sizeStyles = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base';
        const colorStyles = variant === 'outline' ? 'text-primary-500' : 'text-white';
        return `${baseStyles} ${sizeStyles} ${colorStyles}`;
    };

    const getLoadingColor = (): string => {
        return variant === 'outline' ? '#f97316' : 'white';
    };

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={disabled || loading}
            className={`
        ${getVariantStyles()}
        ${getSizeStyles()}
        ${disabled || loading ? 'opacity-50' : 'opacity-100'}
        ${fullWidth ? 'w-full' : ''}
        flex-row items-center justify-center
        ${className}
      `}
            activeOpacity={0.8}
        >
            {loading ? (
                <View className="flex-row items-center">
                    <ActivityIndicator
                        size="small"
                        color={getLoadingColor()}
                        className="mr-2"
                    />
                    <Text className={getTextStyles()}>Loading...</Text>
                </View>
            ) : (
                <View className="flex-row items-center">
                    {icon && <View className="mr-2">{icon}</View>}
                    <Text className={getTextStyles()}>{title}</Text>
                </View>
            )}
        </TouchableOpacity>
    );
};
