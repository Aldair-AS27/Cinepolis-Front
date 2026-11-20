import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-register-page',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './register-page.html',
})
export class RegisterPage {
  private authService = inject(AuthService);
  private router = inject(Router);

  form = {
    nombres: '',
    apellidos: '',
    correoElectronico: '',
    telefono: '',
    password: '',
  };

  loading = signal(false);
  error = signal<string | null>(null);

  registrar() {
    this.error.set(null);
    this.loading.set(true);

    this.authService.register(this.form).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set(err?.error?.error || 'No se pudo completar el registro. Verifica tus datos.');
      },
    });
  }
}