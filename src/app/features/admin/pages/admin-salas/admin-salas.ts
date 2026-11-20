import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment';

export interface SalaAdmin {
  idSala?: number;
  nombreNumero: string;
  tipoSala: string;
  estado: string;
}

@Component({
  selector: 'app-admin-salas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-salas.html',
})
export class AdminSalasPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/salas`;

  salas = signal<SalaAdmin[]>([]);
  loading = signal(false);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  mensajeError = signal<string | null>(null);

  form: SalaAdmin = this.formVacio();

  ngOnInit() {
    this.cargarSalas();
  }

  private formVacio(): SalaAdmin {
    return {
      nombreNumero: '',
      tipoSala: 'ESTANDAR',
      estado: 'ACTIVA',
    };
  }

  cargarSalas() {
    this.loading.set(true);
    this.http.get<any>(this.apiUrl).subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        this.salas.set(lista);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  abrirCrear() {
    this.editandoId.set(null);
    this.form = this.formVacio();
    this.mensajeError.set(null);
    this.modalAbierto.set(true);
  }

  abrirEditar(s: SalaAdmin) {
    this.editandoId.set(s.idSala ?? null);
    this.form = { ...s };
    this.mensajeError.set(null);
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.mensajeError.set(null);
    const id = this.editandoId();
    const payload = {
      nombreNumero: this.form.nombreNumero,
      tipoSala: this.form.tipoSala,
      estado: this.form.estado,
    };

    const request$ = id
      ? this.http.put(`${this.apiUrl}/${id}`, payload)
      : this.http.post(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarSalas();
      },
      error: (err) => {
        this.mensajeError.set(
          err?.error?.message || 'Error al guardar la sala. Verifica los datos.'
        );
      },
    });
  }

  eliminar(s: SalaAdmin) {
    if (!s.idSala || !confirm(`¿Seguro que deseas eliminar "${s.nombreNumero}"?`)) return;

    this.http.delete(`${this.apiUrl}/${s.idSala}`).subscribe({
      next: () => this.cargarSalas(),
      error: () => alert('No se pudo eliminar la sala (puede tener butacas o funciones asociadas).'),
    });
  }
}