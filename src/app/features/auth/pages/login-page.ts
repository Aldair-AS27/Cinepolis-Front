import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
})
export class LoginPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  correoElectronico = '';
  password = '';
  error = signal<string | null>(null);
  loading = signal(false);

  onSubmit() {
    this.error.set(null);
    this.loading.set(true);

    this.authService.login(this.correoElectronico, this.password).subscribe({
      next: (res) => {
        this.loading.set(false);
        if (res.rol === 'ADMIN') {
          this.router.navigate(['/dashboard']);
        } else {
          this.router.navigate(['/']);
        }
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Correo o contraseña incorrectos.');
      },
    });
  }
}