import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

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

  // Predefined credentials for the special person
  private readonly PREDEFINED_USERNAME = 'Swethaaaaaaa';
  private readonly PREDEFINED_PASSWORD = 'Missyoueveryday';
  private readonly PREDEFINED_USER = {
    username: 'myLove',
    email: 'mylove@forever.com',
    createdAt: new Date('2025-01-24'),
    role: 'special'
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
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
    // Only run in browser
    if (isPlatformBrowser(this.platformId)) {
      // Check if user is already logged in
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.isLoggedIn = true;
          this.currentUser = user;
          // Navigate to dashboard if already logged in
          this.router.navigate(['/dashboard']);
        } else {
          this.isLoggedIn = false;
          this.currentUser = null;
        }
      });

      // Check if predefined user is already in localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          if (user.username === this.PREDEFINED_USERNAME) {
            this.isLoggedIn = true;
            this.currentUser = user;
            this.router.navigate(['/dashboard']);
          }
        } catch (e) {
          // Ignore parsing errors
        }
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
      const username = this.loginForm.get('username')?.value;
      const password = this.loginForm.get('password')?.value;

      // Check if predefined credentials match
      if (username === this.PREDEFINED_USERNAME && password === this.PREDEFINED_PASSWORD) {
        // Predefined user login - bypass backend
        this.successMessage = 'Welcome back, my love! ❤️';
        this.isLoggedIn = true;
        this.currentUser = this.PREDEFINED_USER;
        
        // Save to localStorage
        if (isPlatformBrowser(this.platformId)) {
          localStorage.setItem('currentUser', JSON.stringify(this.PREDEFINED_USER));
          localStorage.setItem('authToken', 'special-token-forever');
        }

        // Reset form
        this.loginForm.reset();
        
        // Navigate to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
        
        this.isLoading = false;
        return;
      }

      // If not predefined, try backend login
      try {
        const response = await this.authService.login({ username, password }).toPromise();
        
        if (response?.success) {
          this.successMessage = response.message || 'Login successful!';
          this.isLoggedIn = true;
          this.currentUser = response.user;
          
          // Save to localStorage
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token || 'auth-token');
          }

          // Reset form
          this.loginForm.reset();
          
          // Navigate to dashboard
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        } else {
          this.errorMessage = response?.message || 'Login failed. Please try again.';
        }
      } catch (backendError) {
        // Backend failed, check if it's the predefined user again (fallback)
        if (username === this.PREDEFINED_USERNAME && password === this.PREDEFINED_PASSWORD) {
          this.successMessage = 'Welcome back, my love! ❤️ (Offline mode)';
          this.isLoggedIn = true;
          this.currentUser = this.PREDEFINED_USER;
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(this.PREDEFINED_USER));
            localStorage.setItem('authToken', 'special-token-forever');
          }

          this.loginForm.reset();
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        } else {
          this.errorMessage = 'Backend is currently unavailable. Please use the predefined credentials or try again later.';
        }
      }
    } catch (error: any) {
      this.errorMessage = error.error?.message || error.message || 'Login failed. Please try again.';
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
      const userData = {
        username: this.signupForm.get('username')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value
      };

      // Check if trying to create an account with the predefined username
      if (userData.username === this.PREDEFINED_USERNAME) {
        this.showSignupMessage = true;
        this.errorMessage = '';
        this.isLoading = false;
        return;
      }

      const response = await this.authService.signup(userData).toPromise();
      
      if (response?.success) {
        this.successMessage = response.message || 'Account created successfully!';
        this.showSignupMessage = false;
        
        setTimeout(() => {
          this.toggleMode();
          this.successMessage = 'Account created! Please login.';
        }, 1500);
      } else {
        if (response?.message?.includes('already taken')) {
          this.showSignupMessage = true;
          this.errorMessage = '';
        } else {
          this.errorMessage = response?.message || 'Signup failed. Please try again.';
        }
      }
    } catch (error: any) {
      if (error.error?.message?.includes('already taken') || error.message?.includes('already taken')) {
        this.showSignupMessage = true;
        this.errorMessage = '';
      } else {
        this.errorMessage = error.error?.message || error.message || 'Signup failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  async onLogout(): Promise<void> {
    try {
      await this.authService.logout().toPromise();
      this.isLoggedIn = false;
      this.currentUser = null;
      this.successMessage = 'Logged out successfully!';
      
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
      
      setTimeout(() => {
        this.successMessage = '';
      }, 2000);
    } catch (error) {
      console.error('Logout error:', error);
      this.isLoggedIn = false;
      this.currentUser = null;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('authToken');
      }
      this.router.navigate(['/login']);
    }
  }

  getLoginErrorMessage(): string {
    const control = this.loginForm.get('username');
    if (control?.hasError('required')) return 'Username is required';
    if (control?.hasError('minlength')) return 'Username must be at least 3 characters';
    return '';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    if (control?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }

  // Helper method to get predefined credentials (can be used in template)
  getPredefinedCredentials(): { username: string; password: string } {
    return {
      username: this.PREDEFINED_USERNAME,
      password: this.PREDEFINED_PASSWORD
    };
  }
}