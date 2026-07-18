// src/app/interfaces/db-interfaces.ts

// Users table interface
export interface User {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}

// User DTO for frontend (without password hash)
export interface UserDTO {
  id: number;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

// Love metrics table interface
export interface LoveMetric {
  id: number;
  user_id: number;
  date: string; // ISO date string (YYYY-MM-DD)
  hours_spent_together: number;
  care_score: number; // 0-100
  feelings_importance_score: number; // 0-100
  special_notes: string | null;
  created_at: string;
  updated_at: string;
}

// Love metrics DTO (for creating/updating)
export interface LoveMetricDTO {
  date: string;
  hours_spent_together: number;
  care_score: number;
  feelings_importance_score: number;
  special_notes?: string;
}

// Timeline events table interface
export interface TimelineEvent {
  id: number;
  user_id: number;
  event_date: string; // ISO date string (YYYY-MM-DD)
  title: string;
  description: string | null;
  event_type: 'first_meeting' | 'date' | 'anniversary' | 'milestone' | 'general';
  photo_url: string | null;
  location: string | null;
  created_at: string;
  updated_at: string;
}

// Timeline event DTO (for creating/updating)
export interface TimelineEventDTO {
  event_date: string;
  title: string;
  description?: string;
  event_type?: string;
  photo_url?: string;
  location?: string;
}

// Mood status table interface
export interface MoodStatus {
  id: number;
  user_id: number;
  mood_state: 'normal' | 'angry';
  message: string | null;
  last_updated: string;
  created_at: string;
}

// Mood status DTO (for updating)
export interface MoodStatusDTO {
  mood_state: 'normal' | 'angry';
  message?: string;
}

// Messages/Notes table interface
export interface Message {
  id: number;
  user_id: number;
  message: string;
  is_read: boolean;
  mood_color: 'green' | 'red';
  created_at: string;
  updated_at: string;
}

// Message DTO (for creating)
export interface MessageDTO {
  message: string;
  mood_color?: 'green' | 'red';
}

// Response wrappers
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

// Filter and query parameters
export interface LoveMetricsFilter {
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

export interface TimelineEventsFilter {
  start_date?: string;
  end_date?: string;
  event_type?: string;
  limit?: number;
  offset?: number;
}

export interface MessagesFilter {
  is_read?: boolean;
  mood_color?: 'green' | 'red';
  limit?: number;
  offset?: number;
}

// Combined stats for dashboard
export interface LoveDashboardStats {
  today_metrics: LoveMetric | null;
  average_care_score: number;
  average_feelings_score: number;
  total_hours_together: number;
  days_tracked: number;
  recent_messages: Message[];
  recent_timeline_events: TimelineEvent[];
  mood_status: MoodStatus | null;
}

// User registration and login
export interface UserRegistrationDTO {
  username: string;
  email: string;
  password: string;
}

export interface UserLoginDTO {
  username: string;
  password: string;
}

export interface UserLoginResponse {
  user: UserDTO;
  token: string;
}

// Update user profile
export interface UserUpdateDTO {
  username?: string;
  email?: string;
  password?: string; // For password change
}