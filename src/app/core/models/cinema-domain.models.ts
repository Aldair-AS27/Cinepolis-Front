// ============================================================================
// Contratos de dominio (espejo de los DTOs del backend: ApiResponse.java, etc.)
// ============================================================================

/** Wrapper estándar detectado en el backend (ApiResponse.java) */
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp?: string;
}

// 1. PELICULA (PeliculaDTO.java)
export interface Pelicula {
  id: number;
  titulo: string;
  sinopsis: string;
  duracionMinutos: number;
  clasificacion: string;
  genero: string;
  posterUrl: string;
  backdropUrl: string;
  trailerUrl?: string;
  estado: 'CARTELERA' | 'PROXIMAMENTE' | 'INACTIVA';
  formatoDestacado: 'IMAX' | 'VIP' | '4DX' | 'MACRO XE' | '2D';
}

// 2. SALA (SalaDTO.java)
export interface Sala {
  id: number;
  nombre: string;
  capacidadTotal: number;
  tipoSala: 'TRADICIONAL' | 'VIP' | 'IMAX' | '4DX' | 'JUNIOR';
  filas: number;
  columnas: number;
}

// 3. BUTACA (ButacaDTO.java - estructura física de la sala)
export type TipoButaca = 'ESTANDAR' | 'VIP' | 'DISCAPACITADO';

export interface Butaca {
  id: number;
  salaId: number;
  fila: string;
  numero: number;
  codigo: string;
  tipo: TipoButaca;
}

// 4. FUNCION_HORARIO (FuncionHorarioDTO.java)
export interface FuncionHorario {
  id: number;
  peliculaId: number;
  sala: Sala;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  idioma: 'SUBTITULADA' | 'DOBLADA';
  formato: '2D' | '3D' | 'IMAX' | 'VIP';
  precioBase: number;
}

// 5. FUNCION_BUTACA (FuncionButacaDTO.java)
export type EstadoFuncionButaca = 'DISPONIBLE' | 'SELECCIONADA' | 'BLOQUEADA' | 'OCUPADA';

export interface FuncionButaca {
  id: number;
  funcionHorarioId: number;
  butaca: Butaca;
  estado: EstadoFuncionButaca;
  precioFinal: number;
  bloqueadoHasta?: string;
}

// 6. BLOQUEO TEMPORAL DE BUTACAS
export interface BloquearButacasRequest {
  funcionHorarioId: number;
  butacaIds: number[];
}

export interface BloqueoResponse {
  funcionHorarioId: number;
  butacasBloqueadas: number[];
  expiraEn: string;
  totalEstimado: number;
}

// ============================================================================
// DTOs reales del backend (Swagger Railway). Solo se usan en la capa de datos;
// los mappers (cinema-mappers.ts) los convierten a las interfaces de dominio.
// ============================================================================

export interface SalaDTO {
  idSala: number;
  nombreNumero: string;
  tipoSala: string;
  estado: string;
}

export interface PeliculaDTO {
  idPelicula: number;
  titulo: string;
  sinopsis: string;
  duracionMinutos: number;
  clasificacion: string;
  genero: string;
  posterUrl: string;
  estado: string;
}

export interface FuncionHorarioDTO {
  idFuncion: number;
  idPelicula: number;
  tituloPelicula: string;
  posterUrl: string;
  idSala: number;
  nombreSala: string;
  fechaHoraInicio: string;
  fechaHoraFin: string;
  formato: string;
  version: string;
  precioBase: number;
  estado: string;
}

export interface FuncionButacaDTO {
  idFuncionButaca: number;
  idButaca: number;
  fila: string;
  numero: number;
  codigoButaca: string;
  tipoButaca: string;
  estadoDisponibilidad: string;
  bloqueadoHasta?: string;
  bloqueadaExpirada?: boolean;
}

export interface BloquearButacasRequestDTO {
  idFuncion: number;
  butacaIds: number[];
}

export interface BloqueoResponseDTO {
  bloqueadoExitoso: boolean;
  mensaje: string;
  idFuncion: number;
  butacasBloqueadas: number[];
  expiraEn: string;
  segundosRestantes: number;
}
