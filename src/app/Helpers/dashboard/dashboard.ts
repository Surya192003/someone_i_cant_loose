import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-dashboard',
 standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
currentUser: any = null;
  welcomeMessage = '';
  daysTogether = 0;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.welcomeMessage = this.getWelcomeMessage();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }
  calculateDaysTogether(): void {
    const startDate = new Date('2025-01-24T00:00:00');
    const today = new Date();
    // Calculate the difference in milliseconds, then convert to days
    const diffTime = Math.abs(today.getTime() - startDate.getTime());
    this.daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning! 🌅';
    if (hour < 17) return 'Good Afternoon! ☀️';
    return 'Good Evening! 🌙';
  }

  onLogout(): void {
    // 1. Clear the storage so they are actually logged out
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    
    // 2. (Optional) If you are using AuthService, you can call it here:
    // this.authService.logout();

    // 3. Navigate back to the login screen
    this.router.navigate(['/login']);
  }
}
