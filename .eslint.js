module.exports = {
  root: true,
  extends: [
    "@react-native-community",
    "eslint:recommended",
    "@typescript-eslint/recommended",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:react-native/all",
    "plugin:import/recommended",
    "plugin:import/typescript",
    "prettier", // Must be last to override other configs
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 2021,
    sourceType: "module",
    project: "./tsconfig.json",
  },
  plugins: [
    "react",
    "react-hooks",
    "react-native",
    "@typescript-eslint",
    "import",
    "jsx-a11y",
    "prettier",
  ],
  rules: {
    // Prettier integration
    "prettier/prettier": [
      "error",
      {
        endOfLine: "auto",
      },
    ],

    // TypeScript specific rules
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        argsIgnorePattern: "^_",
        varsIgnorePattern: "^_",
      },
    ],
    "@typescript-eslint/no-explicit-any": "warn",
    "@typescript-eslint/explicit-function-return-type": "off",
    "@typescript-eslint/explicit-module-boundary-types": "off",
    "@typescript-eslint/no-non-null-assertion": "warn",
    "@typescript-eslint/prefer-const": "error",
    "@typescript-eslint/no-var-requires": "off",

    // React specific rules
    "react/react-in-jsx-scope": "off", // Not needed in React Native
    "react/prop-types": "off", // Using TypeScript for prop validation
    "react/display-name": "off",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // React Native specific rules
    "react-native/no-unused-styles": "error",
    "react-native/split-platform-components": "error",
    "react-native/no-inline-styles": "warn",
    "react-native/no-color-literals": "off", // We're using Tailwind classes
    "react-native/no-raw-text": "off", // Allow raw text in Text components

    // Import rules
    "import/order": [
      "error",
      {
        groups: [
          "builtin",
          "external",
          "internal",
          "parent",
          "sibling",
          "index",
        ],
        "newlines-between": "never",
        alphabetize: {
          order: "asc",
          caseInsensitive: true,
        },
      },
    ],
    "import/no-unresolved": "off", // TypeScript handles this
    "import/named": "off",
    "import/default": "off",
    "import/namespace": "off",

    // General JavaScript rules
    "no-console": "off", // Allow console logs for debugging
    "no-debugger": "error",
    "no-alert": "error",
    "no-unused-vars": "off", // Using TypeScript version instead
    "prefer-const": "error",
    "no-var": "error",
    "object-shorthand": "error",
    "prefer-arrow-callback": "error",
    "prefer-template": "error",
    "template-curly-spacing": ["error", "never"],
    "arrow-spacing": "error",
    "comma-dangle": ["error", "always-multiline"],
    semi: ["error", "always"],
    quotes: ["error", "single", { avoidEscape: true }],
    "jsx-quotes": ["error", "prefer-double"],

    // Accessibility rules
    "jsx-a11y/accessible-emoji": "off", // Emojis are fine in our app
  },
  settings: {
    react: {
      version: "detect",
    },
    "import/resolver": {
      typescript: {
        alwaysTryTypes: true,
        project: "./tsconfig.json",
      },
    },
  },
  env: {
    "react-native/react-native": true,
    es6: true,
    node: true,
    jest: true,
  },
  ignorePatterns: [
    "node_modules/",
    "dist/",
    "build/",
    ".expo/",
    "web-build/",
    "*.config.js",
    "metro.config.js",
  ],
};
