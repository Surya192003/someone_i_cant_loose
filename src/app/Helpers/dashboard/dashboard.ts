import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Diary } from "../../components/diary/diary";

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Diary],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  currentUser: any = null;
  welcomeMessage = '';
  daysTogether = 0;
  loveStartDate = new Date('2025-01-24T00:00:00');
  isAnimated = false; // ✅ Add this property for transition animation

  constructor(
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Trigger animation after component loads
      setTimeout(() => {
        this.isAnimated = true;
      }, 100);

      // Load user data
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          this.currentUser = JSON.parse(savedUser);
          this.welcomeMessage = this.getWelcomeMessage();
          this.calculateDaysTogether();
        } catch (e) {
          this.loadUserFromService();
        }
      } else {
        this.loadUserFromService();
      }
    }
  }

  loadUserFromService(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUser = user;
        this.welcomeMessage = this.getWelcomeMessage();
        this.calculateDaysTogether();
      } else {
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
          try {
            this.currentUser = JSON.parse(savedUser);
            this.welcomeMessage = this.getWelcomeMessage();
            this.calculateDaysTogether();
          } catch (e) {
            this.router.navigate(['/login']);
          }
        } else {
          this.router.navigate(['/login']);
        }
      }
    });
  }

  calculateDaysTogether(): void {
    const today = new Date();
    const diffTime = Math.abs(today.getTime() - this.loveStartDate.getTime());
    this.daysTogether = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getWelcomeMessage(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  }

  // ✅ Add this method for the memories button
  viewMemories(): void {
    // Navigate to memories or show a modal
    alert('Coming soon: Our beautiful memories! 💕');
    // You can also navigate to a memories page:
    // this.router.navigate(['/memories']);
  }

  onLogout(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('authToken');
    }
    
    this.authService.logout().subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: () => {
        this.router.navigate(['/login']);
      }
    });
  }
}