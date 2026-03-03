import api from './api';

export interface ProfileData {
  username: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  suffix: string | null;
  email: string | null;
  profile_picture: string | null;
  role: string;
  // Student specific fields
  student_number?: string;
  course_id?: number;
  year_level?: number;
  section?: string;
  registration_form?: string | null;
  can_edit_profile?: number;
  course_code?: string;
  course_title?: string;
  course_full_name?: string;
  // Faculty specific fields
  unique_faculty_id?: string;
  college_id?: number;
  status?: string;
  profile_updated?: number;
  college_code?: string;
  college_name?: string;
  college_full_name?: string;
  // Common fields
  contact: string;
  is_qualified: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

export interface Course {
  course_id: number; // FIX: Ginawang course_id base sa JSON mo
  course_code: string;
  course_title: string; // FIX: Ginawang course_title base sa JSON mo
}

export interface College {
  college_id: number; // FIX: Ginawang college_id base sa JSON mo
  college_code: string;
  college_name: string;
}

export interface CourseResponse {
  success: boolean;
  courses: Course[]; // FIX: 'courses' ang key sa JSON, hindi 'data'
}

export interface CollegeResponse {
  success: boolean;
  colleges: College[]; // FIX: 'colleges' ang key sa JSON, hindi 'data'
}

/**
 * Fetch all courses.
 */
export const fetchCourses = async (): Promise<CourseResponse> => {
  const response = await api.get<CourseResponse>('/api/courses');
  return response.data;
};

/**
 * Fetch all colleges.
 */
export const fetchColleges = async (): Promise<CollegeResponse> => {
  const response = await api.get<CollegeResponse>('/api/colleges');
  return response.data;
};

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
