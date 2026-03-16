# Troubleshooting Guide: Settings Screen & PDF Issues

## 1. Root Cause Analysis
The primary reason for "503/401 Server Errors" and corrupted file downloads on Android physical devices is that **Localtunnel** requires explicit headers to bypass its warning page. 

When the app tries to download files (like the Registration Form PDF) through Localtunnel, it often catches an HTML "Click to Continue" page instead of the actual file. To fix this, every request—especially file downloads—must include the `Bypass-Tunnel-Reminder: true` header.

---

## 2. Connection Checklist
Before troubleshooting code, ensure your environment is correctly configured:
- **XAMPP:** Ensure both MySQL and Apache are running.
- **Backend:** Run `php artisan serve --port=8000` in your Laravel directory.
- **Localtunnel:** Run `npx localtunnel --port 8000 --subdomain joshua-libsys`.
- **Tunnel Reset:** If you see a **503 Service Unavailable** error, stop and restart the Localtunnel command.
- **Manual Whitelist:** Open `https://joshua-libsys.loca.lt` in your browser (PC or phone). If you see a "Reminder" page, click **"Click to Continue"**. This whitelists your IP for the session.

---

## 3. PDF Viewer Fix
The "Deprecated PDF Viewer" or corrupted download error is resolved by using the legacy Expo FileSystem API and including the bypass headers in the download request.

### Updated `viewSavedRegForm` Function:
Ensure you are importing from `expo-file-system/legacy`.

```typescript
import * as FileSystem from 'expo-file-system/legacy';

const viewSavedRegForm = async () => {
  try {
    const token = await getToken();
    const fileUri = FileSystem.documentDirectory + 'reg_form.pdf';

    const downloadResumable = FileSystem.createDownloadResumable(
      `${API_BASE_URL}/storage/reg_forms/your_file.pdf`,
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
      // Logic to open the PDF
      console.log('Finished downloading to ', result.uri);
      await Linking.openURL(result.uri);
    }
  } catch (e) {
    console.error('PDF Download Error:', e);
  }
};
```

---

## 4. Fresh Start (Fixing 401 Errors)
If you continue to see **401 Unauthorized** errors:
1. **Log Out** of the app on your physical device.
2. **Log In** again.
This refreshes the Bearer Token stored in the keychain, ensuring the headers contain a valid, non-expired session key.
