# 📚 LIBSYS Mobile

Welcome to **LIBSYS Mobile**, a modern, cross-platform mobile frontend built with **React Native** and **Expo**. This app is designed to provide a seamless library management experience with a clean and intuitive user interface.

---

## 🛠️ Quick Start Guide

Follow these steps to get the app running on your machine and your mobile device.

### 1. Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (LTS version)
- **npm** or **yarn**
- **Expo Go** app (Download it from [Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent) or [App Store](https://apps.apple.com/us/app/expo-go/id982107779))
- **Laravel Backend** (Dapat ay running sa host machine)

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
   Gumawa ng `.env` file sa root directory. Dahil gagamit tayo ng tunnel para kumonekta sa backend, sundin ang steps sa ibaba.

---

## 🌐 Connecting to the Backend (Crucial)

Para makapag-login at makakita ng data, kailangan ng "tunnel" dahil madalas ay nagkakaroon ng network blockages sa local Wi-Fi/Firewall.

### Step 1: Run your Laravel Backend
Sa folder ng iyong Laravel project, i-run ang server:
```bash
php artisan serve
```
(Siguraduhin na running ito sa port 8000)

### Step 2: Create a Tunnel (API Portal)
Buksan ang bagong terminal (huwag isara ang Laravel) at i-run ang Localtunnel:
```bash
npx localtunnel --port 8000
```
I-copy ang URL na ibibigay (e.g., `https://shaggy-dogs-run.loca.lt`).

> **Important:** Buksan muna ang link na ito sa browser ng iyong phone. I-click ang "Click to Continue" para ma-authorize ang connection.

### Step 3: Update Mobile .env
I-paste ang tunnel URL sa `.env` ng Libsys-Mobile project:
```env
API_BASE_URL=https://your-localtunnel-link.loca.lt/api
```

---

## 📱 How to Run the App

I-start ang Expo development server gamit ang tunnel flag:

```bash
npx expo start --tunnel -c
```

Kapag lumabas na ang QR code, i-scan ito gamit ang **Expo Go** app sa iyong phone.

---

## ⚠️ Troubleshooting (Network Error / Unreachable)

- **Private DNS:** Sa Android, siguraduhin na ang Private DNS ay naka-OFF (Settings > Network > Private DNS).
- **Tunnel Password:** Kung manghingi ng "Tunnel Password" ang website, i-enter ang External IP ng iyong PC (Makikita sa [whatsmyip.org](https://whatsmyip.org)).
- **Stay Active:** Huwag i-close ang terminal ng Laravel at Localtunnel habang ginagamit ang app.
- **Same Wi-Fi?** Sa method na ito (Localtunnel), hindi na kailangang magka-Wi-Fi ang phone at PC basta parehong may internet.

---

## 📁 Project Structure

```text
src/
├── assets/       # Images, fonts, and static files
├── components/   # Reusable UI elements (Buttons, Inputs, etc.)
├── context/      # Authentication and Global State (AuthContext)
├── navigation/   # App routing logic (Tab and Stack navigators)
├── screens/      # Main application pages (Dashboard, Books, QR)
├── services/     # API integration (Axios calls)
└── styles/       # Global CSS and Tailwind configurations
```

## 🚀 Key Features

- **Real-time Attendance**: Scan QR codes for library check-ins.
- **Book Management**: Browse and manage your library cart.
- **Secure Auth**: Login and session management via Keychain/SecureStore.
- **Cross-Platform**: Optimized for Android, iOS, and Web.

---

Built with ❤️ for Libsys.
