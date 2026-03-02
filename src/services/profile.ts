import api from './api';

export interface ProfileData {
  username: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string;
  profile_picture: string | null;
  student_number: string;
  course_id: number;
  year_level: number;
  section: string;
  contact: string;
  registration_form: string | null;
  can_edit_profile: number;
  course_code: string;
  course_title: string;
  course_full_name: string;
  is_qualified: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

/**
 * Fetch the user's profile details from the API.
 * @returns ProfileResponse containing profile data.
 */
export const fetchProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/api/profile');
  return response.data;
};

/**
 * Update the user's basic profile details.
 * @param data Partial profile data to update.
 * @returns ProfileResponse containing updated profile data.
 */
export const updateProfile = async (
  data: Partial<ProfileData>
): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>('/api/profile/update', data);
  return response.data;
};

/**
 * Upload a new profile picture.
 * @param formData FormData containing the image file.
 * @returns ProfileResponse containing updated profile data.
 */
export const uploadProfilePicture = async (
  formData: FormData
): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>(
    '/api/profile/upload-picture',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};

/**
 * Upload a new registration form PDF.
 * @param formData FormData containing the PDF file.
 * @returns ProfileResponse containing updated profile data.
 */
export const uploadRegistrationForm = async (
  formData: FormData
): Promise<ProfileResponse> => {
  const response = await api.post<ProfileResponse>(
    '/api/profile/upload-registration',
    formData,
    {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }
  );
  return response.data;
};
