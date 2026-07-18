import { Routes } from '@angular/router';
import { Login } from './Helpers/login/login';
import { Dashboard } from './Helpers/dashboard/dashboard';
import { Signupcomponent } from './Helpers/signupcomponent/signupcomponent';
import { AuthGuard } from './guards/auth.guard';

export const routes: Routes = [
 {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    component: Login
  },
  {
    path: 'signup',
    component: Signupcomponent
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./Helpers/dashboard/dashboard')
      .then(m => m.Dashboard),
    canActivate: [AuthGuard]
  },
  {
    path: '**',
    redirectTo: '/login'
  }
];