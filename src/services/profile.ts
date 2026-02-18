import api from './api';

export interface ProfileData {
  id: number;
  last_name: string;
  first_name: string;
  middle_name: string | null;
  suffix: string | null;
  student_number: string;
  course: string;
  year: number;
  section: string;
  email: string;
  contact: string;
  profile_picture: string | null;
  registration_form: string | null;
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
