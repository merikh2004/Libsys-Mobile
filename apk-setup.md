[FEAT] Standalone APK Build & Live Backend Integration
Component
[x] mobile-app (Android)

[x] backend-api (Laravel)

[x] Shared/Database

Problem Statement
The current local development setup uses localhost or local IP addresses, which prevents the mobile application from connecting to the backend when installed as a standalone APK on different devices or networks. To meet project requirements, the system needs a "downloadable" APK that connects to a persistent, live server.

Proposed Solution
Configure the LibSys mobile application to use the production URL at https://libsys-backend.bscs3a.com. Additionally, utilize EAS Cloud Build to generate a standalone .apk file (using the preview profile) for direct distribution via file-sharing methods like Google Drive or ShareIt.

Proposed Architecture (Mobile - MVVM/React Native)
Entity/Model: Update models to handle absolute URL paths for assets (like book covers) hosted on the live server.

Repository/ApiService: Replace the local development base URL with the production endpoint: https://libsys-backend.bscs3a.com/api.

ViewModel/View: Implement loading indicators and error handling to manage network latency and potential timeouts from the live cloud hosting.

Proposed Architecture (Backend - Laravel MVC)
Routes: Optimize the existing api.php routes for production access.

Controllers/Services: Ensure that file-handling logic and response paths are compatible with the production domain at libsys-backend.bscs3a.com.

Models/Migrations: Ensure the production MySQL database is synchronized with the latest local schema to support mobile data requests.

Database Transition & Synchronization
[x] This feature is designed to keep data in sync between the local mobile state and the remote MySQL server.

Notes: The app.json must be updated with the package name com.joshuapaul.libsys to ensure the EAS build identifies the project correctly.

Screenshots (if applicable)
Production Status: The backend is successfully deployed and reachable at the production URL.

Additional Context
This feature is a critical step for the final submission of the LibSys project, transitioning it from a development environment to a ready-to-distribute mobile application.