import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// Mock user data for the backend
export const MOCK_USERS = [
  {
    id: 1,
    username: "Swethaaaaaaa",
    email: "swetha@gmail.com",
    password: "Missyoueveryday",
    isActive: true,
    createdAt: "2024-01-15",
    lastLogin: null
  },
  // Additional mock users for testing
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

// Mock backend service interface
export interface IAuthResponse {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
}

export interface ILoginRequest {
  username: string;
  password: string;
}

export interface ISignupRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {

 loginForm: FormGroup;
  signupForm: FormGroup;
  isLoginMode = true;
  isLoggedIn = false;
  showSignupMessage = false;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  currentUser: any = null;

  // Mock backend methods
  private mockBackend = {
    // Simulate login API call
    login(credentials: ILoginRequest): Promise<IAuthResponse> {
      return new Promise((resolve, reject) => {
        // Simulate network delay
        setTimeout(() => {
          const user = MOCK_USERS.find(
            u => u.username === credentials.username && u.password === credentials.password
          );

          if (user) {
            resolve({
              success: true,
              message: 'Login successful! Welcome back!',
              user: user,
              token: 'mock-jwt-token-' + Date.now()
            });
          } else {
            reject({
              success: false,
              message: 'Invalid username or password. Please try again.'
            });
          }
        }, 800);
      });
    },

    // Simulate signup API call
    signup(userData: ISignupRequest): Promise<IAuthResponse> {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          // Check if username already exists
          const existingUser = MOCK_USERS.find(
            u => u.username === userData.username || u.email === userData.email
          );

          if (existingUser) {
            reject({
              success: false,
              message: 'This heart is already taken! 💔'
            });
          } else {
            // In a real backend, we would save the user
            const newUser = {
              id: MOCK_USERS.length + 1,
              username: userData.username,
              email: userData.email,
              password: userData.password,
              isActive: true,
              createdAt: new Date().toISOString(),
              lastLogin: null
            };
            
            // Add to mock database (in memory)
            MOCK_USERS.push(newUser);
            
            resolve({
              success: true,
              message: 'Signup successful! Please login.',
              user: newUser,
              token: 'mock-jwt-token-' + Date.now()
            });
          }
        }, 1000);
      });
    },

    // Simulate logout
    logout(): Promise<{ success: boolean; message: string }> {
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            message: 'Logged out successfully!'
          });
        }, 300);
      });
    }
  };

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    // Check if user is already logged in (from localStorage in real app)
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        this.currentUser = JSON.parse(savedUser);
        this.isLoggedIn = true;
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }

  passwordMatchValidator(group: FormGroup): any {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  toggleMode(): void {
    this.isLoginMode = !this.isLoginMode;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSignupMessage = false;
    this.loginForm.reset();
    this.signupForm.reset();
  }

  async onLogin(): Promise<void> {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    try {
      const credentials: ILoginRequest = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      const response = await this.mockBackend.login(credentials);
      
      this.successMessage = response.message;
      this.isLoggedIn = true;
      this.currentUser = response.user;
      
      // Save user to localStorage
      localStorage.setItem('currentUser', JSON.stringify(response.user));
      localStorage.setItem('authToken', response.token || '');
      
      // Reset form
      this.loginForm.reset();
      
      // Show success state
      setTimeout(() => {
        this.successMessage = '';
      }, 3000);
    } catch (error: any) {
      this.errorMessage = error.message || 'Login failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async onSignup(): Promise<void> {
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSignupMessage = false;

    try {
      const userData: ISignupRequest = {
        username: this.signupForm.get('username')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value,
        confirmPassword: this.signupForm.get('confirmPassword')?.value
      };

      const response = await this.mockBackend.signup(userData);
      
      this.successMessage = response.message;
      this.showSignupMessage = false;
      
      // Switch to login mode after successful signup
      setTimeout(() => {
        this.toggleMode();
        this.successMessage = 'Account created! Please login.';
      }, 1500);
      
    } catch (error: any) {
      if (error.message?.includes('already taken')) {
        this.showSignupMessage = true;
        this.errorMessage = '';
      }
      this.errorMessage = error.message || 'Signup failed. Please try again.';
    } finally {
      this.isLoading = false;
    }
  }

  async onLogout(): Promise<void> {
    try {
      await this.mockBackend.logout();
      this.isLoggedIn = false;
      this.currentUser = null;
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
      this.successMessage = 'Logged out successfully!';
      
      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  getLoginErrorMessage(): string {
    const control = this.loginForm.get('username');
    if (control?.hasError('required')) return 'Username is required';
    if (control?.hasError('minlength')) return 'Username must be at least 3 characters';
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    if (control?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }
}