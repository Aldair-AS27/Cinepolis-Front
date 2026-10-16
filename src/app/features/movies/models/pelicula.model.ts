// Re-export del contrato de dominio para mantener bajo acoplamiento por feature.
export type { Pelicula } from '../../../core/models/cinema-domain.models';

/** Estado de los filtros del catálogo (capa de presentación). */
export interface FiltroPeliculas {
  busqueda: string;
  formato: 'TODOS' | 'IMAX' | 'VIP' | '4DX';
  estado: 'TODOS' | 'CARTELERA' | 'PROXIMAMENTE';
}
