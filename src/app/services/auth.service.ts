import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { delay, map } from 'rxjs/operators';

export interface User {
  id: number;
  username: string;
  email: string;
  password: string;
  isActive: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: Omit<User, 'password'>;
  token?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  // Mock database
  private mockUsers: User[] = [
    {
      id: 1,
      username: "Swethaaaaaaa",
      email: "swetha@gmail.com",
      password: "Missyoueveryday",
      isActive: true,
      createdAt: "2024-01-15",
      lastLogin: null
    },
    {
      id: 2,
      username: "JohnDoe",
      email: "john@example.com",
      password: "JohnPass123",
      isActive: true,
      createdAt: "2024-02-20",
      lastLogin: null
    }
  ];

  constructor() {
    // Check localStorage on init
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUserSubject.next(user);
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  login(username: string, password: string): Observable<AuthResponse> {
    return of(null).pipe(
      delay(800),
      map(() => {
        const user = this.mockUsers.find(
          u => u.username === username && u.password === password
        );

        if (user) {
          const token = 'mock-jwt-token-' + Date.now();
          const { password: _, ...userWithoutPassword } = user;
          
          this.currentUserSubject.next(user);
          localStorage.setItem('currentUser', JSON.stringify(user));
          localStorage.setItem('authToken', token);

          return {
            success: true,
            message: 'Login successful! Welcome back! 🎉',
            user: userWithoutPassword,
            token
          };
        } else {
          return {
            success: false,
            message: 'Invalid username or password. Please try again.'
          };
        }
      })
    );
  }

  signup(userData: any): Observable<AuthResponse> {
    return of(null).pipe(
      delay(1000),
      map(() => {
        // Check if username or email already exists
        const existingUser = this.mockUsers.find(
          u => u.username === userData.username || u.email === userData.email
        );

        if (existingUser) {
          return {
            success: false,
            message: 'This heart is already taken! 💔'
          };
        }

        const newUser: User = {
          id: this.mockUsers.length + 1,
          username: userData.username,
          email: userData.email,
          password: userData.password,
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: null
        };

        this.mockUsers.push(newUser);
        
        const { password: _, ...userWithoutPassword } = newUser;

        return {
          success: true,
          message: 'Account created successfully! Please login. ❤️',
          user: userWithoutPassword
        };
      })
    );
  }

  logout(): Observable<{ success: boolean; message: string }> {
    return of(null).pipe(
      delay(300),
      map(() => {
        this.currentUserSubject.next(null);
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
        return {
          success: true,
          message: 'Logged out successfully!'
        };
      })
    );
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isLoggedIn(): boolean {
    return this.currentUserSubject.value !== null;
  }
}