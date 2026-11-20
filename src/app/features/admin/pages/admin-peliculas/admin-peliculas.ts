import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { environment } from '../../../../../environments/environment.development';

export interface PeliculaAdmin {
  idPelicula?: number;
  id?: number;
  titulo: string;
  sinopsis: string;
  duracionMinutos: number;
  clasificacion: string;
  genero: string;
  posterUrl: string;
  estado: string;
}

@Component({
  selector: 'app-admin-peliculas',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './admin-peliculas.html',
})
export class AdminPeliculasPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/peliculas`;

  peliculas = signal<PeliculaAdmin[]>([]);
  loading = signal(false);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  mensajeError = signal<string | null>(null);
  busqueda = '';

  form: PeliculaAdmin = this.formVacio();

  ngOnInit() {
    this.cargarPeliculas();
  }

  private formVacio(): PeliculaAdmin {
    return {
      titulo: '',
      sinopsis: '',
      duracionMinutos: 120,
      clasificacion: '+13',
      genero: 'Acción',
      posterUrl: '',
      estado: 'ACTIVA',
    };
  }

  get peliculasFiltradas() {
    const q = this.busqueda.trim().toLowerCase();
    if (!q) return this.peliculas();
    return this.peliculas().filter(
      (p) =>
        p.titulo?.toLowerCase().includes(q) ||
        p.genero?.toLowerCase().includes(q)
    );
  }

  cargarPeliculas() {
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}?todas=true`).subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        this.peliculas.set(lista);
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

  abrirEditar(p: PeliculaAdmin) {
    this.editandoId.set(p.idPelicula ?? p.id ?? null);
    this.form = { ...p };
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
      titulo: this.form.titulo,
      sinopsis: this.form.sinopsis,
      duracionMinutos: Number(this.form.duracionMinutos),
      clasificacion: this.form.clasificacion,
      genero: this.form.genero,
      posterUrl: this.form.posterUrl,
      estado: this.form.estado,
    };

    const request$ = id
      ? this.http.put(`${this.apiUrl}/${id}`, payload)
      : this.http.post(this.apiUrl, payload);

    request$.subscribe({
      next: () => {
        this.cerrarModal();
        this.cargarPeliculas();
      },
      error: (err) => {
        this.mensajeError.set(
          err?.error?.message || 'Error al guardar la película. Verifica los campos.'
        );
      },
    });
  }

  eliminar(p: PeliculaAdmin) {
    const id = p.idPelicula ?? p.id;
    if (!id || !confirm(`¿Seguro que deseas eliminar "${p.titulo}"?`)) return;

    this.http.delete(`${this.apiUrl}/${id}`).subscribe({
      next: () => this.cargarPeliculas(),
      error: () => alert('No se pudo eliminar la película (puede tener funciones asociadas).'),
    });
  }
}