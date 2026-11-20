import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.html',
  styleUrl: './reset-password.css'
})
export class ResetPassword {

  token = '';
  password = '';
  confirmPassword = '';
  message = '';
  errorMessage = '';
  loading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: Auth
  ) {
    this.token = this.route.snapshot.paramMap.get('token') || '';
  }

  resetPassword(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.password || this.password.length < 8) {
      this.errorMessage = 'Password must contain at least 8 characters';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.auth.resetPassword(this.token, this.password).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Password reset failed';
        this.loading = false;
      }
    });
  }
}