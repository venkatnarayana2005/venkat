
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  NavigationEnd,
  Router,
  RouterLink,
  RouterOutlet
} from '@angular/router';
import { filter } from 'rxjs';
import { finalize, timeout } from 'rxjs';

import { Auth, AuthUser } from './services/auth';
import { Home } from './components/home/home';
import { Products } from './components/products/products';
import { Cart } from './components/cart/cart';
import { CartService } from './services/cart';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    RouterLink,
    FormsModule,
    Home,
    Products,
    Cart,
],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  readonly auth = inject(Auth);
  private readonly router = inject(Router);

  menuOpen = false;
  profileOpen = false;
  editMode = false;
  savingProfile = false;

  editName = '';
  editEmail = '';
  editPhone = '';
  editGender = '';
  editAddress = '';

  profileError = '';
  profileMessage = '';

  isAuthPage = this.checkAuthPage();

  constructor() {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.isAuthPage = this.checkAuthPage();
        this.menuOpen = false;
        this.profileOpen = false;
      });
  }

  private checkAuthPage(): boolean {
    const path = this.router.url.split('?')[0].split('#')[0];

    return path === '/login' || path === '/register';
  }

  toggleMenu(): void {
    this.menuOpen = !this.menuOpen;
  }

  closeMenu(): void {
    this.menuOpen = false;
  }

  scrollTo(sectionId: string, event: Event): void {
  event.preventDefault();
  this.closeMenu();

  if (this.router.url.split('?')[0] !== '/') {
    this.router.navigateByUrl('/').then(() => {
      setTimeout(() => this.scrollToElement(sectionId), 100);
    });
  } else {
    this.scrollToElement(sectionId);
  }
}

private scrollToElement(sectionId: string): void {
  document.getElementById(sectionId)?.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
  });
}

  toggleProfile(): void {
    this.profileOpen = !this.profileOpen;

    if (this.profileOpen) {
      const user = this.auth.currentUser();

      if (user) {
        this.startEdit(user, false);
      }
    }
  }

  startEdit(user: AuthUser, enableEditing = true): void {
    this.editName = user.name;
    this.editEmail = user.email;
    this.editPhone = user.phone || '';
    this.editGender = user.gender || '';
    this.editAddress = user.address || '';

    this.editMode = enableEditing;
    this.profileError = '';
    this.profileMessage = '';
  }

  cancelEdit(user: AuthUser): void {
    this.startEdit(user, false);
  }

  
saveProfile(): void {
  if (this.savingProfile) return;

  const user = this.auth.currentUser();

  if (!user) {
    this.profileError = 'Please log in again.';
    return;
  }

  const name = this.editName.trim();
  const phone = this.editPhone.trim();
  const gender = this.editGender;
  const address = this.editAddress.trim();

  if (
    !name ||
    !/^\d{10}$/.test(phone) ||
    !['Male', 'Female', 'Other', 'Prefer not to say']
      .includes(gender) ||
    !address
  ) {
    this.profileError =
      'Enter a name, valid 10-digit phone number, gender, and address.';
    return;
  }

  this.savingProfile = true;
  this.profileError = '';
  this.profileMessage = '';

  this.auth.updateProfile({
    name,
    phone,
    gender,
    address
  }).pipe(
    timeout(10000),
    finalize(() => {
      this.savingProfile = false;
    })
  ).subscribe({
    next: (response) => {
      // Refresh the form using the saved server response.
      const updatedUser = response.user;

      this.editName = updatedUser.name;
      this.editEmail = updatedUser.email;
      this.editPhone = updatedUser.phone || '';
      this.editGender = updatedUser.gender || '';
      this.editAddress = updatedUser.address || '';

      // Exit edit mode and show updated details.
      this.editMode = false;
      this.profileMessage = 'Profile updated successfully.';
    },
    error: (error) => {
      console.error('Profile update failed:', error);

      this.profileError =
        error.name === 'TimeoutError'
          ? 'The server took too long to respond. Please try again.'
          : error.error?.message ||
            'Unable to save profile. Check that the backend is running.';
    }
  });
}


  logout(): void {
    this.auth.logout();
    this.profileOpen = false;
    this.editMode = false;
    this.closeMenu();
    this.router.navigateByUrl('/');
  }
}
