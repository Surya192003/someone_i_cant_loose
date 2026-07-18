import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
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

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
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
      const credentials = {
        username: this.loginForm.get('username')?.value,
        password: this.loginForm.get('password')?.value
      };

      const response = await this.authService.login(credentials).toPromise();
      
      if (response?.success) {
        this.successMessage = response.message || 'Login successful!';
        this.isLoggedIn = true;
        this.currentUser = response.user;
        
        // Reset form
        this.loginForm.reset();
        
        // Navigate to dashboard
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 500);
      } else {
        this.errorMessage = response?.message || 'Login failed. Please try again.';
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

      const response = await this.authService.signup(userData).toPromise();
      
      if (response?.success) {
        this.successMessage = response.message || 'Account created successfully!';
        this.showSignupMessage = false;
        
        // Switch to login mode after successful signup
        setTimeout(() => {
          this.toggleMode();
          this.successMessage = 'Account created! Please login.';
        }, 1500);
      } else {
        // Check if it's the "heart already taken" message
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

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  getPasswordErrorMessage(): string {
    const control = this.loginForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    if (control?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }
}