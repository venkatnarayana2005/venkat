
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { Auth } from '../../services/auth';

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  private auth = inject(Auth);
  private router = inject(Router);

  email = '';
  password = '';
  loading = false;
  errorMessage = '';

  
submitLogin(): void {
  this.errorMessage = '';

  if (!this.email.trim() || !this.password) {
    this.errorMessage = 'Please enter your email and password.';
    return;
  }

  if (this.auth.isLoggedIn()) {
    this.errorMessage = 'You are already logged in. Please log out first.';
    return;
  }

  this.loading = true;

  this.auth.login({
    email: this.email.trim(),
    password: this.password
  }).subscribe({
    next: (response: any) => {
      console.log('Login response:', response);

      const user =
        response?.user ??
        response?.data?.user ??
        (response?._id || response?.id ? response : null);

      if (!user) {
        this.loading = false;
        this.errorMessage =
          'Login succeeded, but the user details were not returned.';
        return;
      }

      sessionStorage.setItem('user', JSON.stringify(user));

      this.loading = false;
      this.router.navigate(['/']);
    },

    error: error => {
      this.loading = false;
      console.error('Login failed:', error);

      this.errorMessage =
        error.error?.message || 'Invalid email or password.';
    }
  });
}

}
