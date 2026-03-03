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
  student_number?: string;
  course_id?: number;
  year_level?: number;
  section?: string;
  registration_form?: string | null;
  can_edit_profile?: number;
  course_code?: string;
  course_title?: string;
  course_full_name?: string;
  unique_faculty_id?: string;
  college_id?: number;
  status?: string;
  profile_updated?: number;
  college_code?: string;
  college_name?: string;
  college_full_name?: string;
  contact: string;
  is_qualified: boolean;
}

export interface ProfileResponse {
  success: boolean;
  data: ProfileData;
}

export interface Course {
  course_id: number;
  course_code: string;
  course_title: string;
}

export interface College {
  college_id: number;
  college_code: string;
  college_name: string;
}

export interface CourseResponse {
  success: boolean;
  courses: Course[];
}

export interface CollegeResponse {
  success: boolean;
  colleges: College[];
}

export const fetchCourses = async (): Promise<CourseResponse> => {
  const response = await api.get<CourseResponse>('/api/courses');
  return response.data;
};

export const fetchColleges = async (): Promise<CollegeResponse> => {
  const response = await api.get<CollegeResponse>('/api/colleges');
  return response.data;
};

export const fetchProfile = async (): Promise<ProfileResponse> => {
  const response = await api.get<ProfileResponse>('/api/profile');
  return response.data;
};

// FIX: Ginawa nating FormData ang tinatanggap para pwedeng magpasa ng image file
export const updateProfile = async (
  data: FormData | Partial<ProfileData>
): Promise<ProfileResponse> => {
  const isFormData = data instanceof FormData;
  const config = isFormData ? { headers: { 'Content-Type': 'multipart/form-data' } } : {};
  const response = await api.post<ProfileResponse>('/api/profile/update', data, config);
  return response.data;
};
