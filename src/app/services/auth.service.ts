import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { API_CONFIG } from '../config/api.config';

export interface User {
  id: number;
  username: string;
  email: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  public isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    // Only check localStorage if running in browser
    if (this.isBrowser) {
      const savedUser = localStorage.getItem('currentUser');
      const token = localStorage.getItem('authToken');
      
      if (savedUser && token) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
        } catch (e) {
          this.clearAuthData();
        }
      }
    }
  }

  login(credentials: LoginCredentials): Observable<AuthResponse> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.login}`;
    return this.http.post<AuthResponse>(url, credentials).pipe(
      tap(response => {
        if (this.isBrowser && response.success && response.user && response.token) {
          localStorage.setItem('currentUser', JSON.stringify(response.user));
          localStorage.setItem('authToken', response.token);
          this.currentUserSubject.next(response.user);
          this.isLoggedInSubject.next(true);
        }
      })
    );
  }

  signup(userData: SignupData): Observable<AuthResponse> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.register}`;
    return this.http.post<AuthResponse>(url, userData);
  }

  logout(): Observable<any> {
    const url = `${API_CONFIG.baseUrl}${API_CONFIG.endpoints.auth.logout}`;
    const token = this.isBrowser ? localStorage.getItem('authToken') : null;
    const headers = new HttpHeaders({
      'Authorization': token ? `Bearer ${token}` : ''
    });
    
    return this.http.post(url, {}, { headers }).pipe(
      tap(() => {
        this.clearAuthData();
      })
    );
  }

  private clearAuthData(): void {
    if (this.isBrowser) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('authToken');
    }
    return null;
  }
}