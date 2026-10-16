import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse, Pelicula, PeliculaDTO } from '../../../core/models/cinema-domain.models';
import { mapPeliculaDtoToDomain } from '../../../core/models/cinema-mappers';

@Injectable({ providedIn: 'root' })
export class PeliculaService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = '/api/peliculas';

  /** `todas` es opcional: si se omite no se envía el query param al backend. */
  listarPeliculas(todas?: boolean): Observable<Pelicula[]> {
    const options =
      todas === undefined ? {} : { params: new HttpParams().set('todas', String(todas)) };

    return this.http
      .get<ApiResponse<PeliculaDTO[]>>(this.baseUrl, options)
      .pipe(map((respuesta) => (respuesta.data ?? []).map(mapPeliculaDtoToDomain)));
  }

  obtenerPelicula(id: number): Observable<Pelicula> {
    return this.http
      .get<ApiResponse<PeliculaDTO>>(`${this.baseUrl}/${id}`)
      .pipe(map((respuesta) => mapPeliculaDtoToDomain(respuesta.data)));
  }

  buscarPeliculas(q: string): Observable<Pelicula[]> {
    return this.http
      .get<ApiResponse<PeliculaDTO[]>>(`${this.baseUrl}/buscar`, {
        params: new HttpParams().set('q', q),
      })
      .pipe(map((respuesta) => (respuesta.data ?? []).map(mapPeliculaDtoToDomain)));
  }

  filtrarPorGenero(genero: string): Observable<Pelicula[]> {
    return this.http
      .get<ApiResponse<PeliculaDTO[]>>(`${this.baseUrl}/genero/${encodeURIComponent(genero)}`)
      .pipe(map((respuesta) => (respuesta.data ?? []).map(mapPeliculaDtoToDomain)));
  }
}
