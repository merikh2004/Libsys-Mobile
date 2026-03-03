# 📚 LIBSYS Mobile

Welcome to **LIBSYS Mobile**, a modern, cross-platform mobile frontend built with **React Native** and **Expo**. This app is designed to provide a seamless library management experience with a clean and intuitive user interface.

---

## 🛠️ Quick Start Guide

Follow these steps to get the app running on your machine and your mobile device.

### 1. Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (LTS version)
- **npm** or **yarn**
- **Expo Go** app (Download it from the [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent) or [Apple App Store](https://apps.apple.com/us/app/expo-go/id982107779))

### 2. Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd Libsys-Mobile
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Rename or create a `.env` file in the root directory and set your API URL.
   > **Note:** If you are testing on a **physical device**, use your computer's local IP address instead of `127.0.0.1` (e.g., `http://192.168.1.10:8000`).

   ```env
   API_BASE_URL=http://your-local-ip:8000
   ```

---

## 📱 How to Run the App

Start the Expo development server by running:

```bash
npm start
```

Once the server is running, you'll see a QR code in your terminal. Here’s how to open the app on different platforms:

### ⚡ Running on a Physical Device (Recommended)
This is the easiest way to test the app with real mobile gestures and hardware.
1. Make sure your phone and computer are on the **same Wi-Fi network**.
2. **Android:** Open the **Expo Go** app and tap "Scan QR Code".
3. **iOS:** Open the default **Camera app** and point it at the QR code.
4. The app will bundle and open automatically!

### 🤖 Running on Android Emulator
1. Open **Android Studio** and start a Virtual Device (AVD).
2. Press `a` in the terminal where Expo is running.
3. The app will install and open on your emulator.

### 🍎 Running on iOS Simulator (Mac Only)
1. Ensure you have **Xcode** installed.
2. Press `i` in the terminal where Expo is running.
3. The app will open in the iOS Simulator.

### 🌐 Running on Web Browser
1. Press `w` in the terminal.
2. The app will open in your default web browser (Chrome/Edge/Safari).

---

## 📁 Project Structure

```text
src/
├── assets/       # Images, fonts, and static files
├── components/   # Reusable UI elements (Buttons, Inputs, etc.)
├── context/      # Authentication and Global State (AuthContext, ToastContext)
├── navigation/   # App routing logic (Tab and Stack navigators)
├── screens/      # Main application pages (Dashboard, Books, QR, etc.)
├── services/     # API integration and business logic
└── styles/       # Global CSS and Tailwind configurations
```

## 🚀 Key Features

- **Real-time Attendance**: Scan QR codes for library check-ins.
- **Book Management**: Browse and manage your library cart.
- **Secure Auth**: Login and session management via Keychain.
- **Cross-Platform**: Optimized for Android, iOS, and Web.

---

Built with ❤️ for Libsys.
