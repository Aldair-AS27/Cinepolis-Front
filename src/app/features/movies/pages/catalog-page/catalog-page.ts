import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { FiltroPeliculas, Pelicula } from '../../models/pelicula.model';
import { MovieHero } from '../../components/movie-hero/movie-hero';
import { MovieFilter } from '../../components/movie-filter/movie-filter';
import { MovieCard } from '../../components/movie-card/movie-card';
import { SkeletonLoader } from '../../../../shared/ui/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-catalog-page',
  imports: [MovieHero, MovieFilter, MovieCard, SkeletonLoader],
  templateUrl: './catalog-page.html',
  styleUrl: './catalog-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CatalogPage {
  private readonly peliculaService = inject(PeliculaService);
  private readonly router = inject(Router);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly peliculas = signal<Pelicula[]>([]);
  readonly filtros = signal<FiltroPeliculas>({
    busqueda: '',
    formato: 'TODOS',
    estado: 'CARTELERA',
  });

  readonly destacada = computed(
    () => this.peliculas().find((pelicula) => pelicula.estado === 'CARTELERA') ?? null,
  );

  readonly filtradas = computed(() => {
    const { busqueda, formato, estado } = this.filtros();
    const termino = busqueda.trim().toLowerCase();

    return this.peliculas().filter((pelicula) => {
      const coincideTexto =
        termino === '' ||
        pelicula.titulo.toLowerCase().includes(termino) ||
        pelicula.genero.toLowerCase().includes(termino);
      const coincideFormato = formato === 'TODOS' || pelicula.formatoDestacado === formato;
      const coincideEstado = estado === 'TODOS' || pelicula.estado === estado;
      return coincideTexto && coincideFormato && coincideEstado;
    });
  });

  constructor() {
    this.cargarPeliculas();
  }

  aplicarFiltros(filtros: FiltroPeliculas): void {
    this.filtros.set(filtros);
  }

  irAlDetalle(pelicula: Pelicula): void {
    void this.router.navigate(['/pelicula', pelicula.id]);
  }

  private cargarPeliculas(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.peliculaService.listarPeliculas().subscribe({
      next: (peliculas) => {
        this.peliculas.set(peliculas);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar la cartelera. Intenta nuevamente en unos segundos.');
        this.cargando.set(false);
      },
    });
  }
}
