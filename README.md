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
   Gumawa ng `.env` file sa root directory para sa API configurations.

---

## 🌐 Full Stack Connection Guide (Step-by-Step Cycle)

Sundin ang 4-step cycle na ito para ma-konekta ang Mobile App sa iyong Laravel Backend nang walang aberya.

### Step 1: Ang Backend Setup (Laravel)
Bago ang lahat, siniguro mo muna na tama ang environment ng backend mo para handa siyang tumanggap ng connection.
1. Binuksan mo ang `.env` file ng Laravel backend mo para i-setup ang database at iba pang configs.
2. Pinaandar mo ang local server mo gamit ang command na:
   ```bash
   php artisan serve
   ```
   *(Tumatakbo na ngayon ang backend mo sa http://127.0.0.1:8000)*

### Step 2: Ang Installation at Pagkuha ng Link (LocalTunnel)
Dahil hindi mababasa ng cellphone ang `127.0.0.1`, kailangan mo ng tulay (tunnel).
1. Nag-open ka ng bagong terminal at in-install / ni-run mo ang LocalTunnel gamit ang command na ito:
   ```bash
   npx localtunnel --port 8000
   ```
   *(Kung gusto mo yung may custom name: `npx localtunnel --port 8000 --subdomain joshua-libsys`)*
2. **Resulta:** May binigay siyang live link sa terminal (Halimbawa: `https://your-custom-link.loca.lt`). **Kinopya mo ito.**

### Step 3: Ang Mobile Setup (React Native)
Ngayong may live link ka na galing sa Step 2, in-update mo ang environment ng mobile app mo.
1. Binuksan mo ang config file ng mobile mo (nasa `.env` o `src/services/api.ts`).
2. Pinalitan mo ang lumang URL at ipinaste ang bagong link:
   ```typescript
   export const BASE_URL = 'https://your-custom-link.loca.lt/api';
   ```
3. **✨ Magic Touch:** Siguraduhin na may `'Bypass-Tunnel-Reminder': 'true'` sa headers ng Axios mo para hindi harangin ng LocalTunnel warning page yung API requests ng app.

### Step 4: Goods na! 🚀
1. Nai-save mo ang files at nag-reload ang Expo app mo.
2. Nag-test ka ng login o nag-fetch ng data.
3. **Pumasok ang data!** Connected na ang React Native UI mo sa Laravel Backend mo.

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
- **Bypass Header:** Kung `403` o `HTML response` ang nakukuha sa API, check kung nandoon ang `Bypass-Tunnel-Reminder` header.

---

## 💡 Summary Shortcut (Pang-Memorya)
1. **Ayusin Backend .env** $\rightarrow$ `php artisan serve`
2. **npx localtunnel --port 8000** $\rightarrow$ `Copy Link`
3. **Paste link sa Mobile config** $\rightarrow$ `Add Bypass header`
4. **Goods na!** Ganyan lang kasimple 'yung cycle, bro.

---

Built with ❤️ for Libsys.
