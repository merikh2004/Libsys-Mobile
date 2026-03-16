# Setup EAS Cloud Build for Android APK

This guide provides the steps to configure the project to build a standalone `.apk` file (instead of `.aab`) using EAS Cloud Build for direct distribution (ShareIt, Google Drive, etc.).

## 1. EAS CLI Installation & Login
Install the EAS CLI globally and log in to your Expo account.

```bash
# Install EAS CLI globally
npm install -g eas-cli

# Log in to your Expo account
eas login
```

## 2. Initialize EAS Configuration
If you haven't already, initialize the EAS configuration in your project:

```bash
eas build:configure
```

## 3. Configure `eas.json` for APK
Update your `eas.json` to include the `"buildType": "apk"` setting. Your `eas.json` should look like this:

```json
{
  "cli": {
    "version": ">= 14.0.0"
  },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

## 4. Run Cloud Build
Run the build command for Android using the `preview` profile to get the APK:

```bash
eas build -p android --profile preview
```

## 5. Credentials & Keystore
When prompted, allow Expo to handle the keystore generation automatically:
- Select **"Generate a new Android Keystore"** (Press **Y** or **Enter**).

## 6. Distribution
Once the build is finished, EAS will provide a download link for the `.apk` file. You can then:
- Download the APK.
- Share it via ShareIt, Google Drive, or any direct file transfer method.
