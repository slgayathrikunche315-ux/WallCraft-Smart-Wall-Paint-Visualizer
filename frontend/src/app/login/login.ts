import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {

  email = '';
  password = '';

  message = '';
  isLoading = false;
  showPassword = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onLogin(loginForm: NgForm): void {

    this.message = '';

    // Check form validation
    if (loginForm.invalid) {
      loginForm.control.markAllAsTouched();
      this.message = 'Please correct the errors before logging in.';
      return;
    }

    // Remove unwanted spaces from email
    this.email = this.email.trim();

    this.isLoading = true;

    this.auth.login({
      email: this.email,
      password: this.password
    }).subscribe({

      next: () => {
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },

      error: (error) => {

        this.isLoading = false;

        if (error.status === 401) {
          this.message = 'Incorrect email or password. Please try again.';
        }
        else if (error.status === 404) {
          this.message = 'Account not found. Please sign up first.';
        }
        else if (error.status === 0) {
          this.message = 'Cannot connect to server. Please try again later.';
        }
        else if (error.status >= 500) {
          this.message = 'Server error. Please try again later.';
        }
        else {
          this.message = error.error?.message || 'Login failed. Please try again.';
        }
      }
    });
  }
}