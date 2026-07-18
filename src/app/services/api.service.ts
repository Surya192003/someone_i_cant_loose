// src/app/services/api.service.ts

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { API_CONFIG, buildUrl } from '../config/api.config';
import {
  UserDTO,
  UserRegistrationDTO,
  UserLoginDTO,
  UserLoginResponse,
  UserUpdateDTO,
  LoveMetric,
  LoveMetricDTO,
  LoveMetricsFilter,
  TimelineEvent,
  TimelineEventDTO,
  TimelineEventsFilter,
  MoodStatus,
  MoodStatusDTO,
  Message,
  MessageDTO,
  MessagesFilter,
  LoveDashboardStats,
  ApiResponse,
  PaginatedResponse
} from '../interfaces/db-interfaces';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json'
    })
  };

  constructor(private http: HttpClient) {}

  // Helper method to get auth token
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  // Helper to handle errors
  private handleError(error: any): Observable<never> {
    console.error('API Error:', error);
    return throwError(() => error);
  }

  // ==================== AUTH ENDPOINTS ====================
  
  login(credentials: UserLoginDTO): Observable<ApiResponse<UserLoginResponse>> {
    const url = buildUrl(API_CONFIG.endpoints.auth.login);
    return this.http.post<ApiResponse<UserLoginResponse>>(url, credentials, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  register(userData: UserRegistrationDTO): Observable<ApiResponse<UserDTO>> {
    const url = buildUrl(API_CONFIG.endpoints.auth.register);
    return this.http.post<ApiResponse<UserDTO>>(url, userData, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  logout(): Observable<ApiResponse> {
    const url = buildUrl(API_CONFIG.endpoints.auth.logout);
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse>(url, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  refreshToken(): Observable<ApiResponse<{ token: string }>> {
    const url = buildUrl(API_CONFIG.endpoints.auth.refreshToken);
    return this.http.post<ApiResponse<{ token: string }>>(url, {}, this.httpOptions)
      .pipe(catchError(this.handleError));
  }

  verifyToken(): Observable<ApiResponse<{ valid: boolean; user?: UserDTO }>> {
    const url = buildUrl(API_CONFIG.endpoints.auth.verifyToken);
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<{ valid: boolean; user?: UserDTO }>>(url, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== USER ENDPOINTS ====================

  getProfile(): Observable<ApiResponse<UserDTO>> {
    const url = buildUrl(API_CONFIG.endpoints.users.profile);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<UserDTO>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  updateProfile(updateData: UserUpdateDTO): Observable<ApiResponse<UserDTO>> {
    const url = buildUrl(API_CONFIG.endpoints.users.update);
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<UserDTO>>(url, updateData, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteProfile(): Observable<ApiResponse> {
    const url = buildUrl(API_CONFIG.endpoints.users.delete);
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== LOVE METRICS ENDPOINTS ====================

  getAllLoveMetrics(filter?: LoveMetricsFilter): Observable<ApiResponse<PaginatedResponse<LoveMetric>>> {
    const url = buildUrl(API_CONFIG.endpoints.loveMetrics.base, filter);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<PaginatedResponse<LoveMetric>>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getTodayLoveMetrics(): Observable<ApiResponse<LoveMetric>> {
    const url = buildUrl(API_CONFIG.endpoints.loveMetrics.today);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<LoveMetric>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getLoveMetricsRange(startDate: string, endDate: string): Observable<ApiResponse<LoveMetric[]>> {
    const url = buildUrl(API_CONFIG.endpoints.loveMetrics.range, { startDate, endDate });
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<LoveMetric[]>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getLoveMetricsStats(): Observable<ApiResponse<any>> {
    const url = buildUrl(API_CONFIG.endpoints.loveMetrics.stats);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<any>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  createLoveMetric(metricData: LoveMetricDTO): Observable<ApiResponse<LoveMetric>> {
    const url = buildUrl(API_CONFIG.endpoints.loveMetrics.base);
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<LoveMetric>>(url, metricData, { headers })
      .pipe(catchError(this.handleError));
  }

  updateLoveMetric(id: number, metricData: Partial<LoveMetricDTO>): Observable<ApiResponse<LoveMetric>> {
    const url = buildUrl(`${API_CONFIG.endpoints.loveMetrics.base}/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<LoveMetric>>(url, metricData, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteLoveMetric(id: number): Observable<ApiResponse> {
    const url = buildUrl(`${API_CONFIG.endpoints.loveMetrics.base}/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== TIMELINE EVENTS ENDPOINTS ====================

  getAllTimelineEvents(filter?: TimelineEventsFilter): Observable<ApiResponse<PaginatedResponse<TimelineEvent>>> {
    const url = buildUrl(API_CONFIG.endpoints.timelineEvents.base, filter);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<PaginatedResponse<TimelineEvent>>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getTimelineEventsByDate(date: string): Observable<ApiResponse<TimelineEvent[]>> {
    const url = buildUrl(API_CONFIG.endpoints.timelineEvents.byDate, { date });
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<TimelineEvent[]>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getTimelineEventTypes(): Observable<ApiResponse<string[]>> {
    const url = buildUrl(API_CONFIG.endpoints.timelineEvents.types);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<string[]>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  createTimelineEvent(eventData: TimelineEventDTO): Observable<ApiResponse<TimelineEvent>> {
    const url = buildUrl(API_CONFIG.endpoints.timelineEvents.base);
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<TimelineEvent>>(url, eventData, { headers })
      .pipe(catchError(this.handleError));
  }

  updateTimelineEvent(id: number, eventData: Partial<TimelineEventDTO>): Observable<ApiResponse<TimelineEvent>> {
    const url = buildUrl(`${API_CONFIG.endpoints.timelineEvents.base}/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<TimelineEvent>>(url, eventData, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteTimelineEvent(id: number): Observable<ApiResponse> {
    const url = buildUrl(`${API_CONFIG.endpoints.timelineEvents.base}/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== MOOD STATUS ENDPOINTS ====================

  getMoodStatus(): Observable<ApiResponse<MoodStatus>> {
    const url = buildUrl(API_CONFIG.endpoints.moodStatus.base);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<MoodStatus>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  updateMoodStatus(moodData: MoodStatusDTO): Observable<ApiResponse<MoodStatus>> {
    const url = buildUrl(API_CONFIG.endpoints.moodStatus.update);
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<MoodStatus>>(url, moodData, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== MESSAGES ENDPOINTS ====================

  getAllMessages(filter?: MessagesFilter): Observable<ApiResponse<PaginatedResponse<Message>>> {
    const url = buildUrl(API_CONFIG.endpoints.messages.base, filter);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<PaginatedResponse<Message>>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getUnreadMessages(): Observable<ApiResponse<Message[]>> {
    const url = buildUrl(API_CONFIG.endpoints.messages.unread);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<Message[]>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  createMessage(messageData: MessageDTO): Observable<ApiResponse<Message>> {
    const url = buildUrl(API_CONFIG.endpoints.messages.base);
    const headers = this.getAuthHeaders();
    return this.http.post<ApiResponse<Message>>(url, messageData, { headers })
      .pipe(catchError(this.handleError));
  }

  markMessageAsRead(id: number): Observable<ApiResponse<Message>> {
    const url = buildUrl(`${API_CONFIG.endpoints.messages.markRead}/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse<Message>>(url, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  markAllMessagesAsRead(): Observable<ApiResponse> {
    const url = buildUrl(API_CONFIG.endpoints.messages.markAllRead);
    const headers = this.getAuthHeaders();
    return this.http.put<ApiResponse>(url, {}, { headers })
      .pipe(catchError(this.handleError));
  }

  deleteMessage(id: number): Observable<ApiResponse> {
    const url = buildUrl(`${API_CONFIG.endpoints.messages.base}/${id}`);
    const headers = this.getAuthHeaders();
    return this.http.delete<ApiResponse>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  // ==================== DASHBOARD ENDPOINTS ====================

  getDashboardStats(): Observable<ApiResponse<LoveDashboardStats>> {
    const url = buildUrl(API_CONFIG.endpoints.dashboard.stats);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<LoveDashboardStats>>(url, { headers })
      .pipe(catchError(this.handleError));
  }

  getDashboardSummary(): Observable<ApiResponse<any>> {
    const url = buildUrl(API_CONFIG.endpoints.dashboard.summary);
    const headers = this.getAuthHeaders();
    return this.http.get<ApiResponse<any>>(url, { headers })
      .pipe(catchError(this.handleError));
  }
}