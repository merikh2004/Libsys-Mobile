import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '../context/ToastContext';
import { BASE_URL } from '../services/api';
import { getToken } from '../services/keychain';
import {
  College,
  Course,
  fetchColleges,
  fetchCourses,
  fetchProfile,
  ProfileData,
  updateProfile,
} from '../services/profile';

const SettingsScreen = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  const [authToken, setAuthToken] = useState<string | null>(null);

  const [pendingProfilePic, setPendingProfilePic] = useState<{ uri: string } | null>(null);
  const [pendingRegForm, setPendingRegForm] = useState<any | null>(null);

  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  const loadProfile = async () => {
    try {
      const [response, token] = await Promise.all([
        fetchProfile(),
        getToken()
      ]);

      setAuthToken(token);

      if (response.success) {
        setProfile(response.data);
        setFormData(response.data);
        setPendingProfilePic(null);
        setPendingRegForm(null);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
      showToast('Failed to load profile', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadMetadata = async () => {
    try {
      const [coursesRes, collegesRes] = await Promise.all([
        fetchCourses(),
        fetchColleges(),
      ]);
      if (coursesRes.success && coursesRes.courses) setCourses(coursesRes.courses);
      if (collegesRes.success && collegesRes.colleges) setColleges(collegesRes.colleges);
    } catch (error) {
      console.error('Failed to load metadata:', error);
    }
  };

  useEffect(() => {
    loadProfile();
    loadMetadata();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, []);

  const isFaculty = profile?.role === 'faculty' || profile?.role === 'staff';
  const canEdit = isFaculty || profile?.can_edit_profile === 1;

  const pickImageFromGallery = async () => {
    const { granted } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!granted) {
      showToast("Access to photos is required!", "warning");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setPendingProfilePic({ uri: result.assets[0].uri });
      setIsEditing(true);
    }
  };

  const triggerDocumentUpload = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf', 
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];

        if (Platform.OS === 'web') {
          setPendingRegForm(asset.file);
        } else {
          setPendingRegForm({
            uri: asset.uri,
            name: asset.name,
            type: asset.mimeType || 'application/pdf',
          });
        }
        setIsEditing(true);
      }
    } catch (error) {
      console.error("Error picking document:", error);
      showToast('Failed to open file picker', 'error');
    }
  };

  const removePendingRegForm = () => {
    setPendingRegForm(null);
  };

  const getAssetUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;

    let cleanPath = path.replace(/\\/g, '/');

    if (!cleanPath.startsWith('storage/') && !cleanPath.includes('/storage/')) {
      cleanPath = `storage/${cleanPath}`; 
    }

    const serverUrl = BASE_URL.replace(/\/api\/?$/, '');

    return `${serverUrl}${cleanPath.startsWith('/') ? '' : '/'}${cleanPath}`;
  };

  const viewSavedRegForm = async () => {
    if (pendingRegForm) {
      if (Platform.OS === 'web') {
        try {
          const objectUrl = URL.createObjectURL(pendingRegForm);
          window.open(objectUrl, '_blank');
        } catch (err) {
          console.error("Error creating object URL for draft:", err);
          showToast('Could not preview the draft file.', 'error');
        }
      } else {
        try {
          await Linking.openURL(pendingRegForm.uri);
        } catch (err) {
          console.error("Couldn't open local file on mobile", err);
          showToast('Cannot open file.', 'error');
        }
      }
      return;
    }

    if (profile?.registration_form) {
      if (Platform.OS === 'web') {
        const url = getAssetUrl(profile.registration_form);
        if (url) window.open(url, '_blank');
      } else {
        try {
          const url = getAssetUrl(profile.registration_form);
          if (!url) return;

          const fileUri = FileSystem.documentDirectory + 'reg_form.pdf';
          const token = await getToken();

          const downloadResumable = FileSystem.createDownloadResumable(
            url,
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
            await Linking.openURL(result.uri);
          }
        } catch (e) {
          console.error('PDF Download Error:', e);
          showToast('Failed to download PDF.', 'error');
        }
      }
    }
  };

  const handleUpdateProfile = async () => {
    const requiredFields: (keyof ProfileData)[] = isFaculty
      ? ['first_name', 'last_name', 'contact', 'college_id']
      : ['first_name', 'last_name', 'email', 'contact', 'section', 'course_id'];

    const missingFields = requiredFields.filter(field => !formData[field]);

    if (missingFields.length > 0) {
      const fieldLabels = missingFields.map(f => f.replace('_', ' ').toUpperCase());
      showToast(`Required fields: ${fieldLabels.join(', ')}`, 'warning');
      return;
    }

    const contact = formData.contact || '';
    const isContactValid =
      (contact.startsWith('09') && contact.length === 11) ||
      (contact.startsWith('+639') && contact.length === 13) ||
      (contact.startsWith('639') && contact.length === 12);

    if (!isContactValid) {
      showToast('Invalid contact number format.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const submitData = new FormData();

      Object.keys(formData).forEach((key) => {
        if (formData[key] !== null && formData[key] !== undefined && key !== 'profile_picture' && key !== 'registration_form') {
          submitData.append(key, String(formData[key]));
        }
      });

      if (pendingProfilePic) {
        if (Platform.OS === 'web') {
          try {
            const res = await fetch(pendingProfilePic.uri);
            const blob = await res.blob();

            const jpegFile: File = await new Promise((resolve, reject) => {
              const img = document.createElement('img');
              img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                if (ctx) {
                  ctx.fillStyle = '#FFFFFF';
                  ctx.fillRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0);
                }

                canvas.toBlob((newBlob) => {
                  if (newBlob) {
                    resolve(new File([newBlob], 'profile.jpg', { type: 'image/jpeg' }));
                  } else {
                    reject(new Error('Canvas toBlob failed'));
                  }
                }, 'image/jpeg', 0.9);
              };
              img.onerror = () => reject(new Error('Image load failed'));
              img.src = URL.createObjectURL(blob);
            });

            submitData.append('profile_picture', jpegFile);
          } catch (e) {
            console.error("Web Image Conversion Error:", e);
            const res = await fetch(pendingProfilePic.uri);
            const blob = await res.blob();
            submitData.append('profile_picture', blob, 'profile.jpg');
          }
        } else {
          const filename = pendingProfilePic.uri.split('/').pop() || 'profile.jpg';
          const match = /\.(\w+)$/.exec(filename);
          const type = match ? `image/${match[1]}` : `image/jpeg`;

          submitData.append('profile_picture', {
            uri: pendingProfilePic.uri,
            name: filename,
            type,
          } as any);
        }
      }

      if (pendingRegForm) {
        submitData.append('registration_form', pendingRegForm as any);
      }

      const response = await updateProfile(submitData);

      if (response.success || response.message === "Profile updated successfully.") {
        setIsEditing(false);
        setPendingProfilePic(null);
        setPendingRegForm(null);

        showToast('Profile updated successfully', 'success');
        await loadProfile();
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error?.response?.data || error.message);
      if (error?.response?.data?.errors) {
        const errorMessages = Object.values(error.response.data.errors).flat().join('\n');
        showToast(errorMessages, 'error');
      } else {
        showToast('Failed to update profile', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const displayPic = pendingProfilePic?.uri || getAssetUrl(profile?.profile_picture);

  const displayRegFormName = pendingRegForm?.name
    ? pendingRegForm.name
    : (profile?.registration_form ? profile.registration_form.replace(/\\/g, '/').split('/').pop() : 'No file uploaded. Upload PDF only.');

  const handleInputChange = (field: keyof ProfileData, text: string) => {
    let formattedText = text;
    if (field === 'year_level') {
      formattedText = text.replace(/[^0-9]/g, '').substring(0, 1);
    }
    else if (field === 'section') {
      formattedText = text.replace(/[^a-zA-Z]/g, '').toUpperCase().substring(0, 1);
    }
    else if (field === 'contact') {
      formattedText = text.replace(/[^\d+]/g, '');
      if (formattedText.startsWith('+63')) {
        formattedText = formattedText.substring(0, 13);
      } else if (formattedText.startsWith('63')) {
        formattedText = formattedText.substring(0, 12);
      } else if (formattedText.startsWith('09')) {
        formattedText = formattedText.substring(0, 11);
      } else if (formattedText.length > 0 && !formattedText.startsWith('+') && !formattedText.startsWith('6') && !formattedText.startsWith('0')) {
        formattedText = '09' + formattedText.replace(/[^0-9]/g, '');
        formattedText = formattedText.substring(0, 11);
      }
    }
    setFormData({ ...formData, [field]: formattedText });
  };

  const renderInput = (label: string, field: keyof ProfileData, keyboardType: any = 'default', isRequired = false) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-1.5 ml-1">
        <Text className="text-slate-500 font-medium">{label}</Text>
        {isRequired && <Text className="text-red-500 ml-1">*</Text>}
      </View>
      <TextInput
        className={`w-full px-4 py-3 rounded-xl border ${isEditing ? 'bg-white border-orange-100 text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500'
          }`}
        value={String(formData[field] || '')}
        onChangeText={(text) => handleInputChange(field, text)}
        editable={isEditing}
        placeholder={`Enter ${label.toLowerCase()}`}
        keyboardType={keyboardType}
      />
    </View>
  );

  const renderDropdown = () => {
    const label = isFaculty ? 'College' : 'Course';
    const isRequired = true;

    const data = isFaculty
      ? (colleges || []).map(c => ({
        label: c.college_name || c.college_code,
        value: c.college_id
      }))
      : (courses || []).map(c => ({
        label: c.course_title || c.course_code,
        value: c.course_id
      }));

    const currentValue = isFaculty ? formData.college_id : formData.course_id;

    const displayValue = isFaculty
      ? colleges.find(c => c.college_id === profile?.college_id)?.college_name || profile?.college_name || 'N/A'
      : courses.find(c => c.course_id === profile?.course_id)?.course_title || profile?.course_title || 'N/A';

    return (
      <View className="mb-4">
        <View className="flex-row items-center mb-1.5 ml-1">
          <Text className="text-slate-500 font-medium">{label}</Text>
          {isRequired && <Text className="text-red-500 ml-1">*</Text>}
        </View>

        {isEditing ? (
          <Dropdown
            style={styles.dropdown}
            placeholderStyle={styles.placeholderStyle}
            selectedTextStyle={styles.selectedTextStyle}
            inputSearchStyle={styles.inputSearchStyle}
            iconStyle={styles.iconStyle}
            data={data}
            search
            maxHeight={300}
            labelField="label"
            valueField="value"
            placeholder={`Select ${label}`}
            searchPlaceholder="Search..."
            value={currentValue}
            onChange={item => {
              if (isFaculty) {
                setFormData({ ...formData, college_id: item.value as number });
              } else {
                setFormData({ ...formData, course_id: item.value as number });
              }
            }}
            renderLeftIcon={() => (
              <Ionicons
                style={styles.icon}
                color="#EA580C"
                name={isFaculty ? "business-outline" : "book-outline"}
                size={20}
              />
            )}
          />
        ) : (
          <View className="w-full px-4 py-3 rounded-xl border bg-slate-50 border-slate-100 flex-row items-center">
            <Ionicons name={isFaculty ? "business-outline" : "book-outline"} size={20} color="#94a3b8" />
            <Text className="text-slate-500 ml-2">{displayValue}</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading) return <View className="flex-1 items-center justify-center bg-[#f8fafc]"><ActivityIndicator size="large" color="#EA580C" /></View>;

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#f8fafc]" edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: 100 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />}
        >
          <View className="p-6">
            {/* PROFILE PICTURE SECTION */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 items-center">
              <View className="relative mb-4">
                <View className="w-32 h-32 rounded-full bg-slate-200 border-4 border-white shadow-lg overflow-hidden">
                  {displayPic ? (
                    <Image 
                      source={{ 
                        uri: displayPic,
                        headers: {
                          Authorization: `Bearer ${authToken}`,
                          'Bypass-Tunnel-Reminder': 'true'
                        }
                      }} 
                      style={{ width: '100%', height: '100%' }} 
                    />
                  ) : (
                    <Ionicons name="person" size={64} color="#94a3b8" style={{ alignSelf: 'center', marginTop: 25 }} />
                  )}
                </View>
                {canEdit && (
                  <TouchableOpacity
                    onPress={pickImageFromGallery}
                    className="absolute bottom-0 right-0 bg-orange-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-sm"
                  >
                    <Ionicons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              {/* NAME AND BADGE SECTION */}
              <View className="flex-row items-center justify-center flex-wrap mt-1">
                <Text className="text-xl font-bold text-slate-900 uppercase text-center mr-2">
                  {profile?.first_name} {profile?.last_name}
                </Text>

                {/* VERIFIED BADGE */}
                {profile?.is_qualified && (
                  <View className="bg-blue-50 px-2 py-1 rounded-full border border-blue-200 flex-row items-center">
                    <Ionicons name="checkmark-circle" size={14} color="#3b82f6" />
                    <Text className="text-blue-600 text-xs font-bold ml-1 uppercase">Verified</Text>
                  </View>
                )}
              </View>

            </View>

            {/* BASIC INFO */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={20} color="#334155" />
                  <Text className="text-xl font-bold text-slate-800 ml-2">Basic Information</Text>
                </View>

                {canEdit && (
                  <TouchableOpacity
                    onPress={() => setIsEditing(!isEditing)}
                    className={`w-10 h-10 items-center justify-center rounded-xl border ${isEditing ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
                      }`}
                  >
                    <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={20} color={isEditing ? '#ef4444' : '#EA580C'} />
                  </TouchableOpacity>
                )}
              </View>
              {renderInput('Last Name', 'last_name', 'default', true)}
              {renderInput('First Name', 'first_name', 'default', true)}
              {renderInput('Middle Name', 'middle_name')}
              {renderInput('Suffix', 'suffix')}
            </View>

            {/* DETAILS SECTION */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
              <View className="flex-row items-center mb-6">
                <Ionicons name={isFaculty ? "briefcase-outline" : "school-outline"} size={20} color="#334155" />
                <Text className="text-xl font-bold text-slate-800 ml-2">
                  {isFaculty ? 'Faculty Details' : 'Student Details'}
                </Text>
              </View>
              <View className="mb-4">
                <Text className="text-slate-500 font-medium mb-1.5 ml-1">User ID</Text>
                <View className="w-full px-4 py-3 rounded-xl border bg-slate-100 border-slate-100">
                  <Text className="text-slate-500">
                    {isFaculty ? profile?.unique_faculty_id : profile?.student_number}
                  </Text>
                </View>
              </View>

              {renderDropdown()}

              {!isFaculty && (
                <View className="flex-row space-x-4">
                  <View style={{ flex: 1 }}>{renderInput('Year', 'year_level', 'numeric', true)}</View>
                  <View style={{ flex: 1 }}>{renderInput('Section', 'section', 'default', true)}</View>
                </View>
              )}
              {renderInput('Email', 'email', 'email-address', !isFaculty)}
              {renderInput('Contact', 'contact', 'phone-pad', true)}
            </View>

            {/* REGISTRATION DOCUMENTS */}
            {!isFaculty && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
                <View className="flex-row items-center mb-6">
                  <Ionicons name="folder-outline" size={20} color="#334155" />
                  <Text className="text-xl font-bold text-slate-800 ml-2">Registration Documents</Text>
                </View>

                <View className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-4">
                  <View className="flex-row items-center mb-4">
                    <View className="bg-white w-12 h-12 rounded-xl items-center justify-center border border-slate-100 shadow-sm">
                      <Ionicons name="document-text" size={24} color={pendingRegForm ? "#EA580C" : "#3b82f6"} />
                    </View>
                    <View className="ml-4 flex-1">
                      <Text className="text-slate-900 font-bold text-base">Registration Form</Text>
                      <Text className="text-slate-500 text-xs mt-1" numberOfLines={1}>
                        {displayRegFormName}
                      </Text>
                      {pendingRegForm && (
                        <Text className="text-orange-500 text-[10px] font-bold mt-1">Ready to upload (Draft)</Text>
                      )}
                    </View>
                  </View>

                  {((pendingRegForm || profile?.registration_form) || (isEditing && canEdit)) && (
                    <View className="flex-row justify-end space-x-2 mt-2 border-t border-slate-200 pt-3">

                      {isEditing && pendingRegForm && (
                        <TouchableOpacity
                          onPress={removePendingRegForm}
                          className="px-3 py-2 rounded-lg bg-red-50 border border-red-100"
                        >
                          <Text className="text-red-500 font-bold text-sm">Remove</Text>
                        </TouchableOpacity>
                      )}

                      {(pendingRegForm || profile?.registration_form) && (
                        <TouchableOpacity
                          onPress={viewSavedRegForm}
                          className="px-3 py-2 rounded-lg bg-blue-50 border border-blue-100"
                        >
                          <Text className="text-blue-600 font-bold text-sm">View</Text>
                        </TouchableOpacity>
                      )}

                      {isEditing && canEdit && (
                        <TouchableOpacity
                          onPress={triggerDocumentUpload}
                          className="px-3 py-2 rounded-lg bg-orange-50 border border-orange-100"
                        >
                          <Text className="text-orange-600 font-bold text-sm">
                            {profile?.registration_form || pendingRegForm ? 'Replace' : 'Upload PDF'}
                          </Text>
                        </TouchableOpacity>
                      )}

                    </View>
                  )}
                </View>
              </View>
            )}

            {isEditing && (
              <TouchableOpacity
                onPress={handleUpdateProfile}
                disabled={submitting}
                className={`w-full bg-orange-600 py-4 rounded-2xl items-center shadow-lg mt-4 ${submitting ? 'opacity-70' : ''}`}
              >
                {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  dropdown: { height: 48, backgroundColor: 'white', borderColor: '#ffedd5', borderWidth: 1, borderRadius: 12, paddingHorizontal: 16 },
  icon: { marginRight: 10 },
  placeholderStyle: { fontSize: 14, color: '#94a3b8' },
  selectedTextStyle: { fontSize: 14, color: '#0f172a' },
  iconStyle: { width: 20, height: 20 },
  inputSearchStyle: { height: 40, fontSize: 14, borderRadius: 8 },
});