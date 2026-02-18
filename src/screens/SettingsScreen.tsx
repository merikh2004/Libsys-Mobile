import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
  RefreshControl,
  KeyboardAvoidingView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { 
  fetchProfile, 
  updateProfile, 
  ProfileData 
} from '../services/profile';
import { BASE_URL } from '../services/api';

const SettingsScreen = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<ProfileData>>({});

  const loadProfile = async () => {
    try {
      const response = await fetchProfile();
      if (response.success) {
        setProfile(response.data);
        setFormData(response.data);
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadProfile();
  }, []);

  const handleUpdateProfile = async () => {
    setSubmitting(true);
    try {
      const response = await updateProfile(formData);
      if (response.success) {
        setProfile(response.data);
        setIsEditing(false);
        if (Platform.OS === 'web') alert('Profile updated successfully.');
      }
    } catch (error) {
      console.error('Failed to update profile:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const getFullProfilePictureUrl = (path: string | null) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    return `${BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`;
  };

  const renderInput = (label: string, field: keyof ProfileData, keyboardType: any = 'default') => (
    <View className="mb-4">
      <Text className="text-slate-500 font-medium mb-1.5 ml-1">{label}</Text>
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

  if (loading) {
    return (
      <View className="flex-1 bg-white items-center justify-center">
        <ActivityIndicator size="large" color="#EA580C" />
      </View>
    );
  }

  const MainContent = (
    <View className="p-6">
      {/* My Profile Header */}
      <View className="mb-8">
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
          {isEditing && (
            <TouchableOpacity 
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
          <Text className="text-blue-600 font-bold text-sm">{profile?.student_number || 'N/A'}</Text>
        </View>
      </View>

      {/* Basic Info */}
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        <View className="flex-row justify-between items-center mb-6">
          <View className="flex-row items-center">
            <Ionicons name="person-outline" size={20} color="#334155" />
            <Text className="text-xl font-bold text-slate-800 ml-2">Basic Information</Text>
          </View>
          <TouchableOpacity 
            onPress={() => setIsEditing(!isEditing)}
            className={`flex-row items-center px-4 py-2 rounded-xl border ${
              isEditing ? 'bg-red-50 border-red-100' : 'bg-orange-50 border-orange-100'
            }`}
          >
            <Ionicons name={isEditing ? 'close-outline' : 'create-outline'} size={18} color={isEditing ? '#ef4444' : '#EA580C'} />
            <Text className={`font-bold ml-1.5 ${isEditing ? 'text-red-500' : 'text-orange-600'}`}>
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </Text>
          </TouchableOpacity>
        </View>
        {renderInput('Last Name', 'last_name')}
        {renderInput('First Name', 'first_name')}
        {renderInput('Middle Name', 'middle_name')}
        {renderInput('Suffix', 'suffix')}
      </View>

      {/* Student Details */}
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        <View className="flex-row items-center mb-6">
          <Ionicons name="school-outline" size={20} color="#334155" />
          <Text className="text-xl font-bold text-slate-800 ml-2">Student Details</Text>
        </View>
        <View className="mb-4">
          <Text className="text-slate-500 font-medium mb-1.5 ml-1">User ID</Text>
          <View className="w-full px-4 py-3 rounded-xl border bg-slate-100 border-slate-100">
            <Text className="text-slate-500">{profile?.student_number}</Text>
          </View>
        </View>
        {renderInput('Course', 'course')}
        <View className="flex-row space-x-4">
          <View style={{ flex: 1 }}>{renderInput('Year', 'year', 'numeric')}</View>
          <View style={{ flex: 1 }}>{renderInput('Section', 'section')}</View>
        </View>
        {renderInput('Email', 'email', 'email-address')}
        {renderInput('Contact', 'contact', 'phone-pad')}
      </View>

      {/* Registration Docs */}
      <View className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 mb-8">
        <View className="flex-row items-center mb-6">
          <Ionicons name="folder-outline" size={20} color="#334155" />
          <Text className="text-xl font-bold text-slate-800 ml-2">Registration Documents</Text>
        </View>
        <View className="rounded-2xl p-6 border-2 border-dashed border-slate-100 bg-slate-50 flex-row items-center">
          <View className="bg-white w-12 h-12 rounded-xl items-center justify-center border border-slate-100">
            <Ionicons name="document-text" size={24} color="#3b82f6" />
          </View>
          <View className="ml-4 flex-1">
            <Text className="text-slate-900 font-bold text-base">Registration Form</Text>
            <Text className="text-slate-500 text-xs mt-1">Upload PDF only.</Text>
          </View>
        </View>
      </View>

      {/* Save Button */}
      {isEditing && (
        <TouchableOpacity 
          onPress={handleUpdateProfile}
          disabled={submitting}
          className={`w-full bg-orange-600 py-4 rounded-2xl items-center shadow-lg mb-12 ${submitting ? 'opacity-70' : ''}`}
        >
          {submitting ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Save Changes</Text>}
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: '#f8fafc' }}>
      {Platform.OS === 'web' ? (
        <ScrollView 
          style={{ flex: 1 }}
          contentContainerStyle={{ flexGrow: 1 }}
          showsVerticalScrollIndicator={true}
        >
          {MainContent}
        </ScrollView>
      ) : (
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={{ flex: 1 }}
        >
          <ScrollView 
            style={{ flex: 1 }}
            contentContainerStyle={{ flexGrow: 1 }}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#EA580C']} />
            }
          >
            {MainContent}
          </ScrollView>
        </KeyboardAvoidingView>
      )}
    </View>
  );
};

export default SettingsScreen;
