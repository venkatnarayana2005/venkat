
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../services/auth';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  private auth = inject(Auth);
  private router = inject(Router);

  name = '';
  email = '';
  number = '';
  password = '';
  cpassword = '';
  gender = '';
  address = '';

  errorMessage = '';
  successMessage = '';
  loading = false;

  register(): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (
      !this.name.trim() ||
      !this.email.trim() ||
      !this.number.trim() ||
      !this.password ||
      !this.cpassword ||
      !this.gender ||
      !this.address.trim()
    ) {
      this.errorMessage = 'Please fill in all fields.';
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address.';
      return;
    }

    if (!/^\d{10}$/.test(this.number.trim())) {
      this.errorMessage = 'Enter a valid 10-digit phone number.';
      return;
    }

    if (this.password.length < 8) {
      this.errorMessage =
        'Password must contain at least 8 characters.';
      return;
    }

    if (this.password !== this.cpassword) {
      this.errorMessage = 'Passwords do not match.';
      return;
    }

    this.loading = true;

    this.auth.register({
      name: this.name.trim(),
      email: this.email.trim(),
      phone: this.number.trim(),
      password: this.password,
      gender: this.gender,
      address: this.address.trim()
    }).subscribe({
      next: (response) => {
        this.loading = false;
        this.successMessage =
          response.message || 'Registration successful!';

        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        console.error('Registration error:', err);

        this.errorMessage =
          err.error?.message ||
          (err.status === 0
            ? 'Cannot connect to the backend. Check whether the server is running on port 5000.'
            : `Registration failed. HTTP status: ${err.status}`);
      }
    });
  }
}
