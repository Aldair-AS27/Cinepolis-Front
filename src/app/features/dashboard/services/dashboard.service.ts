import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, forkJoin, map, Observable, of, switchMap } from 'rxjs';
import { ApiResponse, FuncionHorario, SalaDTO } from '../../../core/models/cinema-domain.models';
import { inferirTipoSala } from '../../../core/models/cinema-mappers';
import { PeliculaService } from '../../movies/services/pelicula.service';
import { FuncionService } from '../../booking/services/funcion.service';
import { Pelicula } from '../../movies/models/pelicula.model';
import {
  DatosDashboard,
  FuncionDetallada,
  PeliculaDetallada,
  SalaInfo,
} from '../models/dashboard.models';

/**
 * Carga todos los datos necesarios para el dashboard directamente de la DB
 * (vía API): películas + funciones de cada película + butacas de cada función
 * + catálogo de salas. Todo lo que falle parcialmente se degrada a vacío para
 * no tumbar el panel completo.
 */
@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly peliculaService = inject(PeliculaService);
  private readonly funcionService = inject(FuncionService);

  cargarDashboard(): Observable<DatosDashboard> {
    return forkJoin({
      peliculas: this.peliculaService.listarPeliculas(),
      salas: this.obtenerSalas(),
    }).pipe(
      switchMap(({ peliculas, salas }) =>
        (peliculas.length === 0
          ? of<PeliculaDetallada[]>([])
          : forkJoin(peliculas.map((pelicula) => this.cargarPelicula(pelicula)))
        ).pipe(map((detalladas) => ({ peliculas: detalladas, salas }))),
      ),
    );
  }

  private cargarPelicula(pelicula: Pelicula): Observable<PeliculaDetallada> {
    return this.funcionService.obtenerFuncionesPorPelicula(pelicula.id).pipe(
      switchMap((funciones) =>
        (funciones.length === 0
          ? of<FuncionDetallada[]>([])
          : forkJoin(funciones.map((funcion) => this.cargarFuncion(funcion)))
        ).pipe(map((detalladas) => ({ pelicula, funciones: detalladas }))),
      ),
      catchError(() => of({ pelicula, funciones: [] })),
    );
  }

  private cargarFuncion(funcion: FuncionHorario): Observable<FuncionDetallada> {
    return this.funcionService.obtenerButacas(funcion.id, funcion.precioBase).pipe(
      map((butacas) => ({ funcion, butacas })),
      catchError(() => of({ funcion, butacas: [] })),
    );
  }

  private obtenerSalas(): Observable<SalaInfo[]> {
    return this.http.get<ApiResponse<SalaDTO[]>>('/api/salas').pipe(
      map((respuesta) =>
        (respuesta.data ?? []).map((dto) => ({
          id: dto.idSala,
          nombre: dto.nombreNumero,
          tipo: inferirTipoSala(dto.nombreNumero, dto.tipoSala),
          estado: dto.estado,
        })),
      ),
      catchError(() => of([] as SalaInfo[])),
    );
  }
}
