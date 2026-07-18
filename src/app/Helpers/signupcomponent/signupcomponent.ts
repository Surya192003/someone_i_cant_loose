import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-signupcomponent',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,RouterModule
  ],
  templateUrl: './signupcomponent.html',
  styleUrl: './signupcomponent.css',
})
export class Signupcomponent {
  signupForm: FormGroup;
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  showHeartTakenMessage = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.signupForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(group: FormGroup): any {
    const password = group.get('password')?.value;
    const confirmPassword = group.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  async onSignup(): Promise<void> {
    if (this.signupForm.invalid) {
      this.errorMessage = 'Please fill in all required fields correctly.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';
    this.showHeartTakenMessage = false;

    try {
      const userData = {
        username: this.signupForm.get('username')?.value,
        email: this.signupForm.get('email')?.value,
        password: this.signupForm.get('password')?.value
      };

      const response = await this.authService.signup(userData).toPromise();

      if (response?.success) {
        this.successMessage = response.message;
        this.showHeartTakenMessage = false;
        
        // Navigate to login after successful signup
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      } else {
        // Check if it's the "heart already taken" message
        if (response?.message?.includes('already taken')) {
          this.showHeartTakenMessage = true;
          this.errorMessage = '';
        } else {
          this.errorMessage = response?.message || 'Signup failed. Please try again.';
        }
      }
    } catch (error: any) {
      if (error.message?.includes('already taken')) {
        this.showHeartTakenMessage = true;
        this.errorMessage = '';
      } else {
        this.errorMessage = error.message || 'Signup failed. Please try again.';
      }
    } finally {
      this.isLoading = false;
    }
  }

  getUsernameErrorMessage(): string {
    const control = this.signupForm.get('username');
    if (control?.hasError('required')) return 'Username is required';
    if (control?.hasError('minlength')) return 'Username must be at least 3 characters';
    return '';
  }

  getEmailErrorMessage(): string {
    const control = this.signupForm.get('email');
    if (control?.hasError('required')) return 'Email is required';
    if (control?.hasError('email')) return 'Please enter a valid email address';
    return '';
  }

  getPasswordErrorMessage(): string {
    const control = this.signupForm.get('password');
    if (control?.hasError('required')) return 'Password is required';
    if (control?.hasError('minlength')) return 'Password must be at least 6 characters';
    return '';
  }
}
