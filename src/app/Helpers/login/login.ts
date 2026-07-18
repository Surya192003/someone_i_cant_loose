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
    username: 'Swethaaaaaaa',
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
      // Check if user is already logged in via localStorage
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          this.currentUser = user;
          this.isLoggedIn = true;
          // Navigate to dashboard if already logged in
          this.router.navigate(['/dashboard']);
          return;
        } catch (e) {
          // Ignore parsing errors
        }
      }

      // Check auth service as fallback
      this.authService.currentUser$.subscribe(user => {
        if (user) {
          this.isLoggedIn = true;
          this.currentUser = user;
          this.router.navigate(['/dashboard']);
        } else {
          this.isLoggedIn = false;
          this.currentUser = null;
        }
      });
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

  onLogin(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

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
      this.isLoading = false;
      
      // Navigate to dashboard
      setTimeout(() => {
        this.router.navigate(['/dashboard']);
      }, 500);
      return;
    }

    // If not predefined, try backend login (optional)
    this.authService.login({ username, password }).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.successMessage = response.message || 'Login successful!';
          this.isLoggedIn = true;
          this.currentUser = response.user;
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(response.user));
            localStorage.setItem('authToken', response.token || 'auth-token');
          }

          this.loginForm.reset();
          this.isLoading = false;
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        } else {
          this.errorMessage = response?.message || 'Login failed. Please try again.';
          this.isLoading = false;
        }
      },
      error: (error) => {
        // Backend failed - check if predefined credentials work as fallback
        if (username === this.PREDEFINED_USERNAME && password === this.PREDEFINED_PASSWORD) {
          this.successMessage = 'Welcome back, my love! ❤️';
          this.isLoggedIn = true;
          this.currentUser = this.PREDEFINED_USER;
          
          if (isPlatformBrowser(this.platformId)) {
            localStorage.setItem('currentUser', JSON.stringify(this.PREDEFINED_USER));
            localStorage.setItem('authToken', 'special-token-forever');
          }

          this.loginForm.reset();
          this.isLoading = false;
          
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 500);
        } else {
          this.errorMessage = 'Login failed. Please check your credentials.';
          this.isLoading = false;
        }
      }
    });
  }

  onSignup(): void {
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showSignupMessage = false;

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

    this.authService.signup(userData).subscribe({
      next: (response: any) => {
        if (response?.success) {
          this.successMessage = response.message || 'Account created successfully!';
          this.showSignupMessage = false;
          this.isLoading = false;
          
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
          this.isLoading = false;
        }
      },
      error: (error) => {
        if (error.error?.message?.includes('already taken') || error.message?.includes('already taken')) {
          this.showSignupMessage = true;
          this.errorMessage = '';
        } else {
          this.errorMessage = error.error?.message || error.message || 'Signup failed. Please try again.';
        }
        this.isLoading = false;
      }
    });
  }

  onLogout(): void {
    // Clear local storage
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }

    // Reset state
    this.isLoggedIn = false;
    this.currentUser = null;
    this.successMessage = 'Logged out successfully!';
    
    // Try backend logout if needed
    this.authService.logout().subscribe({
      next: () => {
        // Successfully logged out from backend
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      },
      error: () => {
        // Even if backend fails, we've cleared local storage
        setTimeout(() => {
          this.successMessage = '';
        }, 2000);
      }
    });

    // Navigate to login (stay on same page but show login form)
    this.router.navigate(['/login']);
  }

 goToDashboard(): void {
  this.router.navigate(['/dashboard']);
  // First, try to get user from component state
  if (this.isLoggedIn && this.currentUser) {
    // Save to localStorage just in case
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
    }
    this.router.navigate(['/dashboard']);
    return;
  }
  
  // If not in component state, check localStorage
  if (isPlatformBrowser(this.platformId)) {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        this.currentUser = user;
        this.isLoggedIn = true;
        this.router.navigate(['/dashboard']);
        return;
      } catch (e) {
        // Ignore parsing errors
        console.error('Error parsing saved user:', e);
      }
    }
    
  }
  
  // If all else fails, go to login
  this.router.navigate(['/login']);
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

  getPredefinedCredentials(): { username: string; password: string } {
    return {
      username: this.PREDEFINED_USERNAME,
      password: this.PREDEFINED_PASSWORD
    };
  }
}