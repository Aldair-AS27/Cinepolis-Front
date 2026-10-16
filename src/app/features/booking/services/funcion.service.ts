import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import {
  ApiResponse,
  BloqueoResponse,
  BloqueoResponseDTO,
  BloquearButacasRequest,
  BloquearButacasRequestDTO,
  FuncionButaca,
  FuncionButacaDTO,
  FuncionHorario,
  FuncionHorarioDTO,
} from '../../../core/models/cinema-domain.models';
import {
  mapBloqueoDtoToDomain,
  mapFuncionButacaDtoToDomain,
  mapFuncionHorarioDtoToDomain,
} from '../../../core/models/cinema-mappers';

const PRECIO_BASE_POR_DEFECTO = 25;

@Injectable({ providedIn: 'root' })
export class FuncionService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/funciones';

  obtenerFuncionesPorPelicula(peliculaId: number): Observable<FuncionHorario[]> {
    return this.http
      .get<ApiResponse<FuncionHorarioDTO[]>>(`${this.baseUrl}/pelicula/${peliculaId}`)
      .pipe(map((respuesta) => (respuesta.data ?? []).map(mapFuncionHorarioDtoToDomain)));
  }

  obtenerFuncion(funcionId: number): Observable<FuncionHorario> {
    return this.http
      .get<ApiResponse<FuncionHorarioDTO>>(`${this.baseUrl}/${funcionId}`)
      .pipe(map((respuesta) => mapFuncionHorarioDtoToDomain(respuesta.data)));
  }

  obtenerButacas(funcionId: number, precioBase = PRECIO_BASE_POR_DEFECTO): Observable<FuncionButaca[]> {
    return this.http
      .get<ApiResponse<FuncionButacaDTO[]>>(`${this.baseUrl}/${funcionId}/butacas`)
      .pipe(
        map((respuesta) =>
          (respuesta.data ?? []).map((dto) =>
            mapFuncionButacaDtoToDomain(dto, funcionId, precioBase),
          ),
        ),
      );
  }

  /**
   * El backend espera `{ idFuncion, butacaIds }` donde `butacaIds` son los
   * `idButaca` físicos (`FuncionButaca.butaca.id`), no `idFuncionButaca`.
   */
  bloquearButacas(request: BloquearButacasRequest): Observable<BloqueoResponse> {
    const payload: BloquearButacasRequestDTO = {
      idFuncion: request.funcionHorarioId,
      butacaIds: request.butacaIds,
    };

    return this.http
      .post<ApiResponse<BloqueoResponseDTO>>(`${this.baseUrl}/bloquear-butacas`, payload)
      .pipe(map((respuesta) => mapBloqueoDtoToDomain(respuesta.data)));
  }

  liberarButacas(idFuncion: number, butacaIds: number[]): Observable<void> {
    return this.http
      .post<ApiResponse<void>>(`${this.baseUrl}/${idFuncion}/liberar-butacas`, butacaIds)
      .pipe(map(() => undefined));
  }
}
