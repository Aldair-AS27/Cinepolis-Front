import { ChangeDetectionStrategy, Component, output, signal } from '@angular/core';
import { FiltroPeliculas } from '../../models/pelicula.model';

@Component({
  selector: 'app-movie-filter',
  imports: [],
  templateUrl: './movie-filter.html',
  styleUrl: './movie-filter.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieFilter {
  readonly formatos: FiltroPeliculas['formato'][] = ['TODOS', 'IMAX', 'VIP', '4DX'];
  readonly estados: FiltroPeliculas['estado'][] = ['CARTELERA', 'PROXIMAMENTE', 'TODOS'];

  readonly busqueda = signal('');
  readonly formato = signal<FiltroPeliculas['formato']>('TODOS');
  readonly estado = signal<FiltroPeliculas['estado']>('CARTELERA');

  readonly filtros = output<FiltroPeliculas>();

  actualizarBusqueda(valor: string): void {
    this.busqueda.set(valor);
    this.emitir();
  }

  cambiarFormato(formato: FiltroPeliculas['formato']): void {
    this.formato.set(formato);
    this.emitir();
  }

  cambiarEstado(estado: FiltroPeliculas['estado']): void {
    this.estado.set(estado);
    this.emitir();
  }

  private emitir(): void {
    this.filtros.emit({
      busqueda: this.busqueda(),
      formato: this.formato(),
      estado: this.estado(),
    });
  }
}
