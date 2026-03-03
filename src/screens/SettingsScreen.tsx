import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useToast } from '../context/ToastContext';
import { BASE_URL } from '../services/api';
import {
  College,
  Course,
  fetchColleges,
  fetchCourses,
  fetchProfile,
  ProfileData,
  updateProfile,
  uploadProfilePicture,
  uploadRegistrationForm
} from '../services/profile';

const SettingsScreen = () => {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [colleges, setColleges] = useState<College[]>([]);

  const loadProfile = async () => {
    try {
      const response = await fetchProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData(response.data);
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
        fetchColleges()
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

    setSubmitting(true);
    try {
      const response = await updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        showToast('Profile updated successfully', 'success');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
      showToast('Failed to update profile', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileChange = async (event: any, type: 'picture' | 'document') => {
    const file = event.target?.files?.[0];
    if (!file) return;

    const data = new FormData();
    data.append(type === 'picture' ? 'profile_picture' : 'registration_form', file);

    setSubmitting(true);
    try {
      let response;
      if (type === 'picture') {
        response = await uploadProfilePicture(data);
      } else {
        response = await uploadRegistrationForm(data);
      }

      if (response.success) {
        setProfile(response.data);
        setFormData(response.data);
        showToast(`${type === 'picture' ? 'Profile picture' : 'Registration form'} uploaded successfully`, 'success');
      }
    } catch (error) {
      console.error(`Failed to upload ${type}:`, error);
      showToast(`Failed to upload ${type}`, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const triggerFileUpload = (type: 'picture' | 'document') => {
    if (Platform.OS !== 'web') {
      showToast('File upload is only supported on web for now', 'info');
      return;
    }
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'picture' ? 'image/*' : '.pdf';
    input.onchange = (e) => handleFileChange(e, type);
    input.click();
  };

  const getFullProfilePictureUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const renderInput = (label: string, field: keyof ProfileData, keyboardType: any = 'default', isRequired = false) => (
    <View className="mb-4">
      <View className="flex-row items-center mb-1.5 ml-1">
        <Text className="text-slate-500 font-medium">{label}</Text>
        {isRequired && <Text className="text-red-500 ml-1">*</Text>}
      </View>
      <TextInput
        className={`w-full px-4 py-3 rounded-xl border ${
          isEditing ? 'bg-white border-orange-100 text-slate-900' : 'bg-slate-50 border-slate-100 text-slate-500'
        }`}
        value={String(formData[field] || '')}
        onChangeText={(text) => setFormData({ ...formData, [field]: text })}
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
          label: c.college_name, 
          value: c.college_id 
        })) 
      : (courses || []).map(c => ({ 
          label: c.course_title, 
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

  if (loading) {
    return (
      <View className="flex-1 bg-[#f8fafc] items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  return (
    <SafeAreaView style={{ flex: 1 }} className="bg-[#f8fafc]" edges={['bottom', 'left', 'right']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        enabled={Platform.OS !== 'web'}
      >
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            Platform.OS !== 'web' ? (
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
            ) : undefined
          }
        >
          <View className="p-6">
            <View className="mb-8 mt-2">
              <Text className="text-3xl font-bold text-slate-900 mb-2">My Profile</Text>
              <Text className="text-slate-500 text-base">Manage your account information and view your activity</Text>
            </View>

            {/* Profile Card */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8 items-center">
              <View className="flex-row items-center self-start mb-6">
                <Ionicons name="person-circle-outline" size={20} color="#334155" />
                <Text className="text-xl font-bold text-slate-800 ml-2">Profile Information</Text>
              </View>

              <View className="relative mb-6">
                <View className="w-32 h-32 rounded-full bg-emerald-500 items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                  {profile?.profile_picture ? (
                    <Image 
                      source={{ uri: getFullProfilePictureUrl(profile.profile_picture) }}
                      style={{ width: '100%', height: '100%' }}
                    />
                  ) : (
                    <Ionicons name="person" size={64} color="white" />
                  )}
                </View>
                {canEdit && (
                  <TouchableOpacity 
                    onPress={() => triggerFileUpload('picture')}
                    className="absolute bottom-0 right-0 bg-orange-500 w-10 h-10 rounded-full items-center justify-center border-2 border-white shadow-sm"
                  >
                    <Ionicons name="camera" size={20} color="white" />
                  </TouchableOpacity>
                )}
              </View>

              <Text className="text-2xl font-bold text-slate-900 text-center uppercase">
                {profile ? `${profile.first_name} ${profile.last_name}` : 'Loading...'}
              </Text>
              <View className="bg-blue-50 px-4 py-1.5 rounded-full mt-2 border border-blue-100">
                <Text className="text-blue-600 font-bold text-sm">
                  {isFaculty ? profile?.unique_faculty_id : profile?.student_number || 'N/A'}
                </Text>
              </View>
            </View>

            {/* Basic Info */}
            <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
              <View className="flex-row justify-between items-center mb-6">
                <View className="flex-row items-center">
                  <Ionicons name="person-outline" size={20} color="#334155" />
                  <Text className="text-xl font-bold text-slate-800 ml-2">Basic Information</Text>
                </View>
                
                {canEdit && (
                  <TouchableOpacity 
                    onPress={() => setIsEditing(!isEditing)}
                    className={`w-10 h-10 items-center justify-center rounded-xl border ${
                      isEditing ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
                    }`}
                  >
                    <Ionicons 
                      name={isEditing ? 'close-outline' : 'create-outline'} 
                      size={20} 
                      color={isEditing ? '#ef4444' : '#EA580C'} 
                    />
                  </TouchableOpacity>
                )}
              </View>
              {renderInput('Last Name', 'last_name', 'default', true)}
              {renderInput('First Name', 'first_name', 'default', true)}
              {renderInput('Middle Name', 'middle_name')}
              {renderInput('Suffix', 'suffix')}
            </View>

            {/* Student/Faculty Details */}
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

            {/* Registration Docs (Students Only) */}
            {!isFaculty && (
              <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-4">
                <View className="flex-row items-center mb-6">
                  <Ionicons name="folder-outline" size={20} color="#334155" />
                  <Text className="text-xl font-bold text-slate-800 ml-2">Registration Documents</Text>
                </View>
                <TouchableOpacity 
                  onPress={() => triggerFileUpload('document')}
                  disabled={!canEdit}
                  className="rounded-2xl p-6 border-2 border-dashed border-slate-100 bg-slate-50 flex-row items-center"
                >
                  <View className="bg-white w-12 h-12 rounded-xl items-center justify-center border border-slate-100">
                    <Ionicons name="document-text" size={24} color="#3b82f6" />
                  </View>
                  <View className="ml-4 flex-1">
                    <Text className="text-slate-900 font-bold text-base">Registration Form</Text>
                    <Text className="text-slate-500 text-xs mt-1">
                      {profile?.registration_form ? profile.registration_form.split('/').pop() : 'No file uploaded. Upload PDF only.'}
                    </Text>
                  </View>
                  {canEdit && (
                    <Ionicons name="cloud-upload-outline" size={20} color="#EA580C" />
                  )}
                </TouchableOpacity>
              </View>
            )}

            {/* Save Button */}
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

// STYLING PARA SA DROPDOWN PARA MAG-MATCH SA IYONG APP THEME
const styles = StyleSheet.create({
  dropdown: {
    height: 48,
    backgroundColor: 'white',
    borderColor: '#ffedd5', // orange-100
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  icon: {
    marginRight: 10,
  },
  placeholderStyle: {
    fontSize: 14,
    color: '#94a3b8', // slate-400
  },
  selectedTextStyle: {
    fontSize: 14,
    color: '#0f172a', // slate-900
  },
  iconStyle: {
    width: 20,
    height: 20,
  },
  inputSearchStyle: {
    height: 40,
    fontSize: 14,
    borderRadius: 8,
  },
});