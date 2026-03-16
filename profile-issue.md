# Troubleshooting Guide: PDF Silent View Fix

This guide explains how to implement a "Silent View" for the Registration Form. This method makes it feel like the user is just opening the file, even though it handles complex localtunnel bypass and caching in the background.

## 1. Silent View Implementation (Code)
The goal is to open the PDF immediately. We handle two cases: **Draft** (file just picked but not saved) and **Saved** (file already on the server).

### Required Imports:
```typescript
import * as FileSystem from 'expo-file-system/legacy';
import * as Linking from 'expo-linking';
import { getToken } from '../services/keychain';
```

### Updated `viewSavedRegForm` Logic:
```typescript
const viewSavedRegForm = async () => {
  // CASE 1: DRAFT FILE (Local View)
  // If the user just picked a file but hasn't clicked 'Save Changes' yet.
  if (pendingRegForm) {
    try {
      await Linking.openURL(pendingRegForm.uri);
    } catch (err) {
      showToast('Could not open draft file.', 'error');
    }
    return; // Exit here
  }

  // CASE 2: SAVED FILE (Server Silent View)
  // If the file is already uploaded to Laravel.
  if (profile?.registration_form) {
    try {
      const token = await getToken();
      const fileUri = FileSystem.documentDirectory + 'reg_form.pdf';
      const pdfUrl = getAssetUrl(profile.registration_form); // Your asset URL helper

      const downloadResumable = FileSystem.createDownloadResumable(
        pdfUrl,
        fileUri,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Bypass-Tunnel-Reminder': 'true', // Crucial for Localtunnel
          },
        }
      );

      const result = await downloadResumable.downloadAsync();
      
      if (result && result.uri) {
        // Opens the PDF silently from the app's internal cache
        await Linking.openURL(result.uri);
      }
    } catch (e) {
      console.error('PDF View Error:', e);
      showToast('Failed to view PDF. Please ensure a PDF viewer is installed.', 'error');
    }
  }
};
```

---

## 2. Why this is the "Silent View" method
*   **No Manual Downloads:** The user never sees a "Download started" notification or has to find the file in their file manager. It opens directly in their preferred PDF app.
*   **Hybrid Handling:** By checking for `pendingRegForm` first, we avoid unnecessary server requests if the file is already sitting on the phone's storage.
*   **Localtunnel Bypass:** The `Bypass-Tunnel-Reminder` header ensures that we fetch the actual PDF data instead of the Localtunnel "Click to Continue" HTML page, which is the #1 cause of "Corrupted PDF" errors.

---

## 3. Quick Checklist if Viewing Fails
1.  **Logout/Login:** If you get a 401 error, your Bearer token might be expired. Re-logging refreshes it.
2.  **Localtunnel Status:** Ensure your tunnel is active (`npx localtunnel ...`).
3.  **PDF Viewer:** Ensure the physical Android device has a PDF viewer installed (Google Drive, OneDrive, or a dedicated PDF app).
