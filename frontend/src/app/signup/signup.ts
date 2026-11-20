import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.html',
  styleUrl: './signup.css'
})
export class Signup {

  name = '';
  email = '';
  password = '';
  confirmPassword = '';

  message = '';
  isLoading = false;

  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private auth: Auth,
    private router: Router
  ) {}

  onSignup(signupForm: NgForm): void {

    this.message = '';

    // Validate all form fields
    if (signupForm.invalid) {
      signupForm.control.markAllAsTouched();
      this.message = 'Please correct the errors in the form.';
      return;
    }

    // Check password match
    if (this.password !== this.confirmPassword) {
      this.message = 'Passwords do not match. Please try again.';
      return;
    }

    // Clean input values
    this.name = this.name.trim();
    this.email = this.email.trim().toLowerCase();

    this.isLoading = true;

    this.auth.signup({
      name: this.name,
      email: this.email,
      password: this.password
    }).subscribe({

      next: (response: any) => {

        this.message = response.message || 'Account created successfully!';
        this.isLoading = false;

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },

      error: (error) => {

  this.isLoading = false;

  console.log('Signup Error Status:', error.status);
  console.log('Signup Error Response:', error.error);

  if (error.status === 409) {
    this.message = 'This email is already registered. Please login.';
  }
  else if (error.status === 400) {
    this.message = error.error?.message || 'Please check your details.';
  }
  else if (error.status === 0) {
    this.message = 'Cannot connect to server. Please try again.';
  }
  else if (error.status >= 500) {
    this.message = 'Server error. Please try again later.';
  }
  else {
    this.message = error.error?.message || 'Signup failed. Please try again.';
  }
}
    });
  }
}