import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface AuthResponse {
  token: string;
  idUsuario: number;
  nombres: string;
  apellidos: string;
  correoElectronico: string;
  rol: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private apiUrl = `${environment.apiUrl}/api/auth`;

  // Signal reactivo para que el navbar sepa al instante si eres ADMIN
  isAdmin = signal<boolean>(this.checkIsAdmin());

  private checkIsAdmin(): boolean {
    return localStorage.getItem('rol') === 'ADMIN' && !!localStorage.getItem('token');
  }

  login(correoElectronico: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { correoElectronico, password })
      .pipe(
        tap((res) => {
          localStorage.setItem('token', res.token);
          localStorage.setItem('rol', res.rol);
          localStorage.setItem('usuario', `${res.nombres} ${res.apellidos}`);
          this.isAdmin.set(res.rol === 'ADMIN');
        })
      );
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    this.isAdmin.set(false);
    this.router.navigate(['/']);
  }
}