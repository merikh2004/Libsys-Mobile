# Comprehensive Troubleshooting Guide: Settings Screen & Profile Issues

## 1. Root Cause Analysis
The primary reason for blank profile data, "503/401 Server Errors", and missing profile pictures on Android physical devices is that **Localtunnel** requires explicit headers to bypass its warning page. Additionally, Laravel's protected assets require a valid **Bearer Token** for authentication.

When the app fetches data or images through Localtunnel, it often receives an HTML "Click to Continue" page instead of the actual resource. To fix this, every request (including images and file downloads) must include the `Bypass-Tunnel-Reminder: true` header.

---

## 2. Connection Checklist
Before troubleshooting code, ensure your environment is correctly configured:
- **XAMPP:** Ensure both MySQL and Apache are running.
- **Backend:** Run `php artisan serve --port=8000` in your Laravel directory.
- **Localtunnel:** Run `npx localtunnel --port 8000 --subdomain joshua-libsys`.
- **Tunnel Reset:** If you see a **503 Service Unavailable** error, stop and restart the Localtunnel command.
- **Manual Whitelist:** Open `https://joshua-libsys.loca.lt` in your browser (PC or phone). If you see a "Reminder" page, click **"Click to Continue"**. This whitelists your IP for the session.

---

## 3. Profile Image & Header Fix
To display the profile picture correctly through the tunnel, the `<Image>` component needs to pass the Bearer token and the bypass header.

### Step A: Add State for the Token
In `SettingsScreen.tsx`, add a state variable to store the authentication token:
```typescript
const [authToken, setAuthToken] = useState<string | null>(null);
```

### Step B: Fetch the Token on Mount
Use a `useEffect` hook to retrieve the token from the keychain:
```typescript
useEffect(() => {
  const fetchToken = async () => {
    const token = await getToken();
    setAuthToken(token);
  };
  fetchToken();
}, []);
```

### Step C: Update the Image Component
Update your `<Image>` source to include the required headers:
```tsx
<Image
  source={{
    uri: `${API_BASE_URL}/storage/profile_images/${profileData.profile_image}`,
    headers: {
      Authorization: `Bearer ${authToken}`,
      'Bypass-Tunnel-Reminder': 'true',
    },
  }}
  style={styles.profileImage}
/>
```

---

## 4. PDF Viewer Fix
The "Deprecated PDF Viewer" error is resolved by using the legacy Expo FileSystem API and including the bypass headers in the download request.

### Updated `viewSavedRegForm` Function:
Ensure you are importing from `expo-file-system/legacy`.

```typescript
import * as FileSystem from 'expo-file-system/legacy';

const viewSavedRegForm = async () => {
  try {
    const token = await getToken();
    const fileUri = FileSystem.documentDirectory + 'reg_form.pdf';

    const downloadResumable = FileSystem.createDownloadResumable(
      `${API_BASE_URL}/api/profile/download-reg-form`,
      fileUri,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Bypass-Tunnel-Reminder': 'true',
        },
      }
    );

    const result = await downloadResumable.downloadAsync();
    
    if (result && result.uri) {
      // Logic to open the PDF (e.g., using Sharing or a PDF viewer)
      console.log('Finished downloading to ', result.uri);
    }
  } catch (e) {
    console.error('PDF Download Error:', e);
  }
};
```

---

## 5. Fresh Start (Fixing 401 Errors)
If you continue to see **401 Unauthorized** errors after applying the fixes:
1. **Log Out** of the app on your physical device.
2. **Log In** again.
This refreshes the Bearer Token stored in the keychain, ensuring the headers contain a valid, non-expired session key.
