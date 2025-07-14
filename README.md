# Yellow Ladder Coffee - POS Mobile App

<p align="center">
  <img src="./assets/logo.png" alt="Yellow Ladder Coffee Logo" width="200" />
</p>

A modern Point of Sale (POS) mobile application built for Yellow Ladder Coffee to streamline ordering process, manage inventory, and enhance customer experience.

## 📱 Features

- **Intuitive Drink Selection**: Browse through coffee menu organized by category
- **Size & Quantity Selection**: Customize orders with different sizes and quantities
- **Order Management**: Add, remove, and modify items in the current order
- **Offline Mode Support**: Process orders even without internet connection
- **Order Queue**: Track pending orders when working offline
- **Real-time Status Updates**: See connection status and order processing indicators
- **Modern UI/UX**: Beautiful, responsive design with smooth animations

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [NativeWind](https://www.nativewind.dev/) (TailwindCSS for React Native)
- **UI Components**:
  - [Bottom Sheet](https://github.com/gorhom/react-native-bottom-sheet)
  - [Safe Area Context](https://docs.expo.dev/versions/latest/sdk/safe-area-context/)
  - [React Navigation](https://reactnavigation.org/)
- **State Management**: React Hooks & Context API
- **Data Persistence**: AsyncStorage
- **Network Status**: Expo Network

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or newer)
- [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/your-username/yellow-ladder-coffee.git
   cd yellow-ladder-coffee/POSMobileApp
   ```

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

3. Start the development server:

   ```bash
   npm start
   # or
   yarn start
   ```

4. Follow the Expo CLI instructions to open the app on your preferred platform

## 📁 Project Structure

```
POSMobileApp/
├── assets/                # Images, fonts, and static files
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── DrinkCard.tsx
│   │   ├── DrinkMenu.tsx
│   │   ├── HeaderSection.tsx
│   │   ├── LoadingSpinner.tsx
│   │   ├── OfflineIndicator.tsx
│   │   ├── OfflineQueueStatus.tsx
│   │   ├── OrderItem.tsx
│   │   ├── OrderSummary.tsx
│   │   └── SizeSelectionModal.tsx
│   ├── hooks/             # Custom React hooks
│   ├── screens/           # App screens
│   │   └── DrinkSelectionScreen.tsx
│   ├── services/          # API and service integrations
│   ├── types/             # TypeScript definitions
│   └── utils/             # Helper functions and constants
├── App.tsx                # Main app component
├── babel.config.js        # Babel configuration
├── tailwind.config.js     # TailwindCSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🏗️ Component Architecture

The app follows a modular component-based architecture for better maintainability and reusability:

### Main Components:

1. **DrinkSelectionScreen**: Main screen broken down into smaller components:
   - **HeaderSection**: Displays app title and connection status
   - **OfflineQueueStatus**: Shows information about pending offline orders
   - **DrinkMenu**: Displays available drinks with refresh functionality
   - **SizeSelectionModal**: Handles drink customization options
   - **OrderItem**: Individual order items with quantity controls
   - **OrderSummary**: Bottom sheet with order details and checkout

### Key Data Types:

```typescript
// Order Item
interface OrderItem {
  id: string;
  drinkId: string;
  name: string;
  size: string;
  price: number;
  quantity: number;
  emoji: string;
}

// Drink Item
interface DrinkItem {
  id: string;
  name: string;
  description: string;
  sizes: Array<{
    size: string;
    price: number;
    volume: string;
  }>;
  category: string;
  emoji: string;
}

// Order
interface Order {
  id: string;
  items: OrderItem[];
  totalPrice: number;
  timestamp: number;
  status: "pending" | "completed" | "cancelled";
}
```

## 🔄 Offline Mode

The app can function without an internet connection:

1. Orders created while offline are stored locally
2. Visual indicators show network status
3. Pending orders are synchronized when connection is restored
4. Queue status is visible to the user

## 🧪 Development

### Code Quality Tools

- **Linting**: ESLint configured with React Native rules
- **Formatting**: Prettier with TailwindCSS plugin
- **Type Checking**: TypeScript strict mode
- **Git Hooks**: Husky & lint-staged for pre-commit validation

### Scripts

- `npm start`: Start the Expo development server
- `npm run ios`: Start the iOS simulator
- `npm run android`: Start the Android emulator
- `npm run lint`: Check for linting issues
- `npm run lint:fix`: Fix linting issues
- `npm run format`: Format code with Prettier
- `npm run type-check`: Run TypeScript type checking
- `npm run validate`: Run all validations (lint, format, type-check)

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add some amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is proprietary software owned by Yellow Ladder Coffee.

## 👥 Team

- Development: [Your Name/Team]
- Design: [Designer Name]
- Product Management: Yellow Ladder Coffee Management

---

<p align="center">
  Made with ☕ for Yellow Ladder Coffee
</p>
