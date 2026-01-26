# 📚 LIBSYS Mobile - Frontend

LIBSYS Mobile is a modern, cross-platform mobile application frontend built with **React Native** and **Expo**. This project focuses on providing a clean and intuitive user interface for the Libsys library management system.

## 🚀 Technologies

- **[React Native](https://reactnative.dev/)** - Core framework
- **[Expo](https://expo.dev/)** - Development platform
- **[TypeScript](https://www.typescriptlang.org/)** - Static typing
- **[React Navigation](https://reactnavigation.org/)** - Navigation management
- **[Expo Router](https://docs.expo.dev/router/introduction/)** - File-based routing (configured)

## 📁 Project Structure

```text
src/
├── api/          # API service configurations
├── assets/       # Static assets (images, fonts)
├── components/   # Reusable UI components
├── constants/    # App constants and theme
├── hooks/        # Custom React hooks
├── navigation/   # Navigation configuration & types
├── screens/      # Application screens (Dashboard, Login, etc.)
├── services/     # Business logic & services
└── utils/        # Helper functions
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (Latest LTS recommended)
- npm or yarn
- Expo Go app on your mobile device (for testing)

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd "Libsys Mobile"
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the App

Start the development server:

```bash
npm start
```

- Press `a` for Android emulator
- Press `i` for iOS simulator
- Press `w` for web
- Scan the QR code with Expo Go (Android) or Camera app (iOS) to run on your physical device.

## 📱 Features

- **Authentication**: Modern login interface.
- **Dashboard**: Overview of library activities and stats.
- **Cross-Platform**: Compatible with Android, iOS, and Web.

## 📜 Scripts

- `npm start`: Starts the Expo development server.
- `npm run android`: Opens the app on an Android emulator/device.
- `npm run ios`: Opens the app on an iOS simulator.
- `npm run web`: Opens the app in a web browser.
- `npm run lint`: Runs ESLint for code quality checks.

---

_Built with ❤️ for Libsys._
