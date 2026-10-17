
import {
  Injectable,
  inject,
  PLATFORM_ID,
  signal
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  gender: string;
  address: string;
}

interface AuthResponse {
  message: string;
  token?: string;
  user: AuthUser;
}

interface UpdateProfileData {
  name: string;
  phone: string;
  gender: string;
  address: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);

  private readonly apiUrl = 'http://localhost:5000/auth';

  readonly currentUser = signal<AuthUser | null>(null);

  private get isBrowser(): boolean {
    return isPlatformBrowser(this.platformId);
  }

  constructor() {
    if (this.isBrowser) {
      this.restoreSession();
    }
  }

  private restoreSession(): void {
    try {
      const token = localStorage.getItem('natural-foods-token');
      const savedUser = localStorage.getItem('natural-foods-user');

      if (token && savedUser) {
        this.currentUser.set(JSON.parse(savedUser) as AuthUser);
      } else {
        this.clearSession();
      }
    } catch {
      this.clearSession();
    }
  }

  private clearSession(): void {
    if (this.isBrowser) {
      localStorage.removeItem('natural-foods-token');
      localStorage.removeItem('natural-foods-user');
    }

    this.currentUser.set(null);
  }

  register(data: {
    name: string;
    email: string;
    phone: string;
    password: string;
    gender: string;
    address: string;
  }): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      data
    );
  }

  login(data: {
    email: string;
    password: string;
  }): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, data)
      .pipe(
        tap(response => {
          if (!response.token || !response.user) {
            throw new Error(
              'Login response is missing token or user details.'
            );
          }

          if (this.isBrowser) {
            localStorage.setItem(
              'natural-foods-token',
              response.token
            );

            localStorage.setItem(
              'natural-foods-user',
              JSON.stringify(response.user)
            );
          }

          this.currentUser.set(response.user);
        })
      );
  }

  
updateProfile(data: {
  name: string;
  phone: string;
  gender: string;
  address: string;
}): Observable<{ message: string; user: AuthUser }> {
  if (!this.isBrowser) {
    throw new Error('Profile updates are only available in the browser.');
  }

  const token = localStorage.getItem('natural-foods-token');

  if (!token) {
    throw new Error('Please log in again.');
  }

  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`
  });

  return this.http.put<{ message: string; user: AuthUser }>(
    `${this.apiUrl}/profile`,
    data,
    { headers }
  ).pipe(
    tap(response => {
      if (!response.user) {
        throw new Error('Updated user details were not returned by the server.');
      }

      localStorage.setItem(
        'natural-foods-user',
        JSON.stringify(response.user)
      );

      this.currentUser.set(response.user);
    })
  );
}


  isLoggedIn(): boolean {
    return this.isBrowser &&
      !!localStorage.getItem('natural-foods-token');
  }

  getUser(): AuthUser | null {
    return this.currentUser();
  }

  logout(): void {
    this.clearSession();
  }
}
