# Troubleshooting Guide: PDF Silent View Fix & Android Security

This guide explains how to implement a "Silent View" for the Registration Form while resolving the common Android crash: `FileUriExposedException: file exposed beyond app through Intent.getData()`.

## 1. Why the Crash Happens
Modern Android versions (7.0/API 24+) prohibit sharing raw `file://` URIs with external apps for security reasons. When you try to open a file directly from the app's private directory using its local path, Android blocks the intent to prevent unauthorized access to your app's internal storage.

## 2. Mandatory Setup & Implementation

### Step 1: Dependency Check
Ensure that the following packages are installed in your project:
```bash
npx expo install expo-sharing expo-file-system
```

### Step 2: The "Content URI" Logic
To share files safely, we use `Sharing.shareAsync`. **Crucially, `Sharing.shareAsync` expects a raw `file://` URI and handles the secure conversion to a `content://` URI internally.** 

If `Sharing` is not available, we manually convert the URI to a Content URI using `FileSystem.getContentUriAsync(fileUri)` and fall back to `Linking.openURL(contentUri)`.

### Step 3: Required Imports
At the top of `src/screens/SettingsScreen.tsx`, ensure you have these imports:
```typescript
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import * as Linking from 'expo-linking';
import { getToken } from '../services/keychain';
```

### Step 4: Updated `viewSavedRegForm` Implementation
Replace your existing function with this complete implementation:

```typescript
const viewSavedRegForm = async () => {
  // CASE 1: DRAFT FILE (Local View)
  if (pendingRegForm) {
    try {
      if (await Sharing.isAvailableAsync()) {
        // MUST pass the raw file:// URI. Sharing handles security internally.
        await Sharing.shareAsync(pendingRegForm.uri, { 
          mimeType: 'application/pdf',
          UTI: 'com.adobe.pdf' 
        });
      } else {
        // Fallback: Manually convert to Content URI for Linking
        const contentUri = await FileSystem.getContentUriAsync(pendingRegForm.uri);
        await Linking.openURL(contentUri);
      }
    } catch (err) {
      console.error("Draft View Error:", err);
      showToast('Could not open draft file.', 'error');
    }
    return;
  }

  // CASE 2: SAVED FILE (Server Silent View)
  if (profile?.registration_form) {
    try {
      const token = await getToken();
      const fileUri = FileSystem.documentDirectory + 'reg_form.pdf';
      const pdfUrl = getAssetUrl(profile.registration_form);

      if (!pdfUrl) {
        showToast('Invalid file URL.', 'error');
        return;
      }

      // Download the PDF with required headers
      const downloadRes = await FileSystem.downloadAsync(
        pdfUrl,
        fileUri,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Bypass-Tunnel-Reminder': 'true', // Crucial for Localtunnel
          },
        }
      );

      // Verify server response (200 OK)
      if (downloadRes.status !== 200) {
        throw new Error(`Server returned status ${downloadRes.status}`);
      }

      if (downloadRes.uri) {
        if (await Sharing.isAvailableAsync()) {
          // Trigger the Android Intent safely using the raw file:// URI
          await Sharing.shareAsync(downloadRes.uri, { 
            mimeType: 'application/pdf',
            UTI: 'com.adobe.pdf'
          });
        } else {
          // Fallback: Manually convert to Content URI for Linking
          const contentUri = await FileSystem.getContentUriAsync(downloadRes.uri);
          await Linking.openURL(contentUri);
        }
      }
    } catch (e) {
      console.error('PDF View Error:', e);
      // Specific alerts for common failures
      showToast('Failed to view PDF. Please ensure a PDF viewer is installed and your connection is stable.', 'error');
    }
  }
};
```

---

## 3. Why this is the "Silent View" method
*   **No Manual Downloads:** The user never sees a "Download started" notification; the PDF opens directly.
*   **Localtunnel Bypass:** The `Bypass-Tunnel-Reminder` header ensures you fetch actual data instead of a "Click to Continue" HTML page.
*   **Android Security:** Using `Sharing.shareAsync` with a raw `file://` URI bypasses the `FileUriExposedException` because the library handles the secure sharing intent.

---

## 4. Final Checklist
1.  [ ] **Imports:** Verify `expo-sharing` and `expo-file-system/legacy` are correctly placed.
2.  [ ] **Headers:** Confirm `Authorization` and `Bypass-Tunnel-Reminder` are present in the `downloadAsync` call.
3.  [ ] **Sharing URI:** Ensure you pass the **raw file path** (`result.uri`) to `Sharing.shareAsync`.
4.  [ ] **MimeType:** Always include `mimeType: 'application/pdf'` in the share options to help Android pick the right app.
5.  [ ] **Fallback:** Use `getContentUriAsync` **only** if falling back to `Linking.openURL`.
