import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
  inject,
  input,
  signal,
} from '@angular/core';
import { forkJoin, of, switchMap } from 'rxjs';
import { FuncionService } from '../../services/funcion.service';
import { ButacaStateService } from '../../services/butaca-state.service';
import { PeliculaService } from '../../../movies/services/pelicula.service';
import { Pelicula } from '../../../movies/models/pelicula.model';
import { FuncionButaca } from '../../models/funcion-butaca.model';
import { SeatGrid } from '../../components/seat-grid/seat-grid';
import { BookingSummary } from '../../components/booking-summary/booking-summary';
import { SkeletonLoader } from '../../../../shared/ui/skeleton-loader/skeleton-loader';

@Component({
  selector: 'app-seat-selection-page',
  imports: [SeatGrid, BookingSummary, SkeletonLoader],
  templateUrl: './seat-selection-page.html',
  styleUrl: './seat-selection-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatSelectionPage implements OnInit, OnDestroy {
  private readonly funcionService = inject(FuncionService);
  private readonly peliculaService = inject(PeliculaService);
  private readonly state = inject(ButacaStateService);

  /** Vinculado desde la ruta `reserva/:funcionId`. */
  readonly funcionId = input<string>('');

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly pelicula = signal<Pelicula | null>(null);

  readonly funcion = this.state.funcionActual;
  readonly butacas = this.state.mapaButacas;
  readonly seleccionadas = this.state.seleccionadas;

  ngOnInit(): void {
    const funcionId = Number(this.funcionId());
    if (Number.isNaN(funcionId) || funcionId <= 0) {
      this.error.set('La función solicitada no es válida.');
      this.cargando.set(false);
      return;
    }
    this.cargar(funcionId);
  }

  ngOnDestroy(): void {
    this.state.limpiarSeleccion();
  }

  toggleButaca(item: FuncionButaca): void {
    this.state.toggleButaca(item);
  }

  private cargar(funcionId: number): void {
    this.cargando.set(true);
    this.error.set(null);

    this.funcionService
      .obtenerFuncion(funcionId)
      .pipe(
        switchMap((funcion) =>
          forkJoin({
            funcion: of(funcion),
            butacas: this.funcionService.obtenerButacas(funcionId),
            pelicula: this.peliculaService.obtenerPelicula(funcion.peliculaId),
          }),
        ),
      )
      .subscribe({
        next: ({ funcion, butacas, pelicula }) => {
          this.state.iniciar(funcion, butacas);
          this.pelicula.set(pelicula);
          this.cargando.set(false);
        },
        error: () => {
          this.error.set('No pudimos cargar el mapa de butacas. Intenta nuevamente.');
          this.cargando.set(false);
        },
      });
  }
}
