import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { PeliculaService } from '../../services/pelicula.service';
import { FuncionService } from '../../../booking/services/funcion.service';
import { Pelicula } from '../../models/pelicula.model';
import { FuncionHorario } from '../../../../core/models/cinema-domain.models';
import { BadgeSala } from '../../../../shared/ui/badge-sala/badge-sala';
import { DurationPipe } from '../../../../shared/pipes/duration-pipe';
import { SkeletonLoader } from '../../../../shared/ui/skeleton-loader/skeleton-loader';
import { ShowtimeSelector } from '../../../booking/components/showtime-selector/showtime-selector';

@Component({
  selector: 'app-movie-detail-page',
  imports: [BadgeSala, DurationPipe, SkeletonLoader, ShowtimeSelector],
  templateUrl: './movie-detail-page.html',
  styleUrl: './movie-detail-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieDetailPage implements OnInit {
  private readonly peliculaService = inject(PeliculaService);
  private readonly funcionService = inject(FuncionService);
  private readonly router = inject(Router);

  /** Vinculado desde la ruta `pelicula/:id` (withComponentInputBinding). */
  readonly id = input<string>('');

  readonly pelicula = signal<Pelicula | null>(null);
  readonly funciones = signal<FuncionHorario[]>([]);
  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    const peliculaId = Number(this.id());
    if (Number.isNaN(peliculaId) || peliculaId <= 0) {
      this.error.set('Película no válida.');
      this.cargando.set(false);
      return;
    }
    this.cargarDetalle(peliculaId);
  }

  reservar(funcion: FuncionHorario): void {
    void this.router.navigate(['/reserva', funcion.id]);
  }

  private cargarDetalle(peliculaId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.peliculaService.obtenerPelicula(peliculaId).subscribe({
      next: (pelicula) => this.pelicula.set(pelicula),
      error: () => {
        this.error.set('No encontramos esa película.');
        this.cargando.set(false);
      },
    });

    this.funcionService.obtenerFuncionesPorPelicula(peliculaId).subscribe({
      next: (funciones) => {
        this.funciones.set(funciones);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set('No pudimos cargar los horarios.');
        this.cargando.set(false);
      },
    });
  }
}
