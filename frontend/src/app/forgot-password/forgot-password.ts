import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forgot-password.html',
  styleUrl: './forgot-password.css'
})
export class ForgotPassword {

  email = '';
  message = '';
  errorMessage = '';
  loading = false;

  constructor(private auth: Auth) {}

  submitEmail(): void {
    this.message = '';
    this.errorMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email address';
      return;
    }

    this.loading = true;

    this.auth.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.message = response.message;
        this.loading = false;
      },
      error: (error) => {
        this.errorMessage =
          error.error?.message || 'Something went wrong. Please try again.';
        this.loading = false;
      }
    });
  }
}