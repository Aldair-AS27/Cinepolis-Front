import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';

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

  isAdmin = signal<boolean>(this.checkIsAdmin());
  isLoggedIn = signal<boolean>(this.checkIsLoggedIn());
  userName = signal<string>(localStorage.getItem('usuario') || '');

  private checkIsAdmin(): boolean {
    return localStorage.getItem('rol') === 'ADMIN' && !!localStorage.getItem('token');
  }

  private checkIsLoggedIn(): boolean {
    return !!localStorage.getItem('token');
  }

  private guardarSesion(res: AuthResponse) {
    const nombreCompleto = `${res.nombres} ${res.apellidos}`.trim();
    localStorage.setItem('token', res.token);
    localStorage.setItem('rol', res.rol);
    localStorage.setItem('usuario', nombreCompleto);
    localStorage.setItem('correo', res.correoElectronico);

    this.isAdmin.set(res.rol === 'ADMIN');
    this.isLoggedIn.set(true);
    this.userName.set(nombreCompleto);
  }

  login(correoElectronico: string, password: string) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/login`, { correoElectronico, password })
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  register(datos: {
    nombres: string;
    apellidos: string;
    correoElectronico: string;
    password: string;
    telefono: string;
  }) {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/register`, datos)
      .pipe(tap((res) => this.guardarSesion(res)));
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCorreo(): string | null {
    return localStorage.getItem('correo');
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('rol');
    localStorage.removeItem('usuario');
    localStorage.removeItem('correo');
    this.isAdmin.set(false);
    this.isLoggedIn.set(false);
    this.userName.set('');
    this.router.navigate(['/']);
  }
}