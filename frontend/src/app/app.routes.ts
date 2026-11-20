import { Routes } from '@angular/router';

import { Login } from './login/login';
import { Signup } from './signup/signup';
import { Dashboard } from './dashboard/dashboard';
import { ForgotPassword } from './forgot-password/forgot-password';
import { ResetPassword } from './reset-password/reset-password';
import { MyDesigns } from './my-designs/my-designs';
import { Profile } from './profile/profile';

import { authGuard } from './services/auth.guard';

export const routes: Routes = [

  { path: 'login', component: Login },

  { path: 'signup', component: Signup },

  { path: 'forgot-password', component: ForgotPassword },

  { path: 'reset-password/:token', component: ResetPassword },

  {
    path: 'dashboard',
    component: Dashboard,
    canActivate: [authGuard]
  },

  {
    path: 'my-designs',
    component: MyDesigns,
    canActivate: [authGuard]
  },

    {
    path: 'profile',
    component: Profile,
    canActivate: [authGuard]
  },

  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: '**', redirectTo: 'login' }

];