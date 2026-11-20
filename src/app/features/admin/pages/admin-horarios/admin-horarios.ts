import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-admin-horarios',
  standalone: true,
  imports: [FormsModule, DatePipe, DecimalPipe],
  templateUrl: './admin-horarios.html',
})
export class AdminHorariosPage implements OnInit {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  peliculas = signal<any[]>([]);
  salas = signal<any[]>([]);
  funciones = signal<any[]>([]);

  peliculaFiltroId = signal<number | null>(null);
  loading = signal(false);
  modalAbierto = signal(false);
  editandoId = signal<number | null>(null);
  mensajeError = signal<string | null>(null);

  form = {
    idPelicula: null as number | null,
    idSala: null as number | null,
    fechaHoraInicio: '',
    formato: '2D',
    version: 'DOBLADA',
    precioBase: 25.0,
    estado: 'PROGRAMADA',
  };

  ngOnInit() {
    this.cargarCatalogos();
  }

  cargarCatalogos() {
    this.http.get<any>(`${this.apiUrl}/api/peliculas`).subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        this.peliculas.set(lista);
        if (lista.length > 0) {
          const primerId = lista[0].idPelicula ?? lista[0].id;
          this.peliculaFiltroId.set(primerId);
          this.cargarFunciones(primerId);
        }
      },
    });

    this.http.get<any>(`${this.apiUrl}/api/salas`).subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        this.salas.set(lista);
      },
    });
  }

  onCambiarPeliculaFiltro(id: any) {
    const idNum = Number(id);
    this.peliculaFiltroId.set(idNum);
    this.cargarFunciones(idNum);
  }

  cargarFunciones(idPelicula: number) {
    if (!idPelicula) return;
    this.loading.set(true);
    this.http.get<any>(`${this.apiUrl}/api/funciones/pelicula/${idPelicula}`).subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        this.funciones.set(lista);
        this.loading.set(false);
      },
      error: () => {
        this.funciones.set([]);
        this.loading.set(false);
      },
    });
  }

  private formatearParaInput(fechaIso: string): string {
    if (!fechaIso) return '';
    const d = new Date(fechaIso);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  abrirCrear() {
    this.editandoId.set(null);
    this.mensajeError.set(null);
    this.form = {
      idPelicula: this.peliculaFiltroId(),
      idSala: this.salas().length > 0 ? this.salas()[0].idSala : null,
      fechaHoraInicio: '',
      formato: '2D',
      version: 'DOBLADA',
      precioBase: 25.0,
      estado: 'PROGRAMADA',
    };
    this.modalAbierto.set(true);
  }

  abrirEditar(f: any) {
    this.editandoId.set(f.idFuncion ?? f.id);
    this.mensajeError.set(null);
    this.form = {
      idPelicula: f.idPelicula ?? this.peliculaFiltroId(),
      idSala: f.idSala,
      fechaHoraInicio: this.formatearParaInput(f.fechaHoraInicio),
      formato: f.formato || '2D',
      version: f.version || 'DOBLADA',
      precioBase: f.precioBase ?? 25.0,
      estado: f.estado || 'PROGRAMADA',
    };
    this.modalAbierto.set(true);
  }

  cerrarModal() {
    this.modalAbierto.set(false);
  }

  guardar() {
    this.mensajeError.set(null);
    if (!this.form.idPelicula || !this.form.idSala || !this.form.fechaHoraInicio) {
      this.mensajeError.set('Completa la película, la sala y la fecha/hora de inicio.');
      return;
    }

    const id = this.editandoId();
    const payload = {
      idPelicula: Number(this.form.idPelicula),
      idSala: Number(this.form.idSala),
      fechaHoraInicio: new Date(this.form.fechaHoraInicio).toISOString(),
      formato: this.form.formato,
      version: this.form.version,
      precioBase: Number(this.form.precioBase),
      estado: this.form.estado,
    };

    const request$ = id
      ? this.http.put(`${this.apiUrl}/api/funciones/${id}`, payload)
      : this.http.post(`${this.apiUrl}/api/funciones`, payload);

    request$.subscribe({
      next: () => {
        this.cerrarModal();
        this.peliculaFiltroId.set(Number(this.form.idPelicula));
        this.cargarFunciones(Number(this.form.idPelicula));
      },
      error: (err) => {
        this.mensajeError.set(
          err?.error?.message || 'Error al guardar la función. Revisa los datos.'
        );
      },
    });
  }

  eliminar(f: any) {
    const id = f.idFuncion ?? f.id;
    if (!id || !confirm(`¿Seguro que deseas eliminar la función #${id}?`)) return;

    this.http.delete(`${this.apiUrl}/api/funciones/${id}`).subscribe({
      next: () => {
        if (this.peliculaFiltroId()) {
          this.cargarFunciones(this.peliculaFiltroId()!);
        }
      },
      error: (err) => {
        alert(err?.error?.message || 'No se pudo eliminar la función.');
      },
    });
  }
}