/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#fef7ee',
                    100: '#fdedd3',
                    200: '#fbd9a5',
                    300: '#f8c06d',
                    400: '#f59e33',
                    500: '#f97316',  // Main orange
                    600: '#ea580c',
                    700: '#c2410c',
                    800: '#9a3412',
                    900: '#7c2d12',
                },
                coffee: {
                    50: '#faf7f0',
                    100: '#f4ede1',
                    200: '#e8d5be',
                    300: '#d4b896',
                    400: '#bc956c',
                    500: '#a67c52',
                    600: '#8b6914',
                    700: '#6f5311',
                    800: '#5c4617',
                    900: '#4e3d18',
                },
                success: {
                    500: '#10b981',
                    600: '#059669',
                },
                error: {
                    500: '#ef4444',
                    600: '#dc2626',
                },
                warning: {
                    500: '#f59e0b',
                    600: '#d97706',
                }
            },
            fontFamily: {
                'sans': ['System'],
            }
        },
    },
    plugins: [],
}
