import {
  BloqueoResponse,
  BloqueoResponseDTO,
  Butaca,
  FuncionButaca,
  FuncionButacaDTO,
  FuncionHorario,
  FuncionHorarioDTO,
  Pelicula,
  PeliculaDTO,
  Sala,
  TipoButaca,
} from './cinema-domain.models';

// ============================================================================
// Mappers puros y defensivos: DTO del backend -> modelo de dominio.
// La UI y ButacaStateService siguen consumiendo únicamente el dominio.
// ============================================================================

export const POSTER_FALLBACK =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1600&q=80';

const CAPACIDAD_POR_DEFECTO = 80;
const FILAS_POR_DEFECTO = 8;
const COLUMNAS_POR_DEFECTO = 10;
const PRECIO_BASE_POR_DEFECTO = 25;
const RECARGO_VIP = 12;

function normalizar(valor?: string | null): string {
  return (valor ?? '').toUpperCase();
}

export function inferirTipoSala(nombreSala?: string, formato?: string): Sala['tipoSala'] {
  const pista = `${normalizar(nombreSala)} ${normalizar(formato)}`;
  if (pista.includes('IMAX')) return 'IMAX';
  if (pista.includes('VIP')) return 'VIP';
  if (pista.includes('4DX')) return '4DX';
  if (pista.includes('JUNIOR') || pista.includes('KIDS')) return 'JUNIOR';
  return 'TRADICIONAL';
}

export function mapTipoButaca(tipoButaca?: string): TipoButaca {
  const tipo = normalizar(tipoButaca);
  if (tipo.includes('VIP')) return 'VIP';
  if (tipo.includes('DISCAP') || tipo.includes('ACCES')) return 'DISCAPACITADO';
  return 'ESTANDAR';
}

function mapFormato(formato?: string): FuncionHorario['formato'] {
  const valor = normalizar(formato);
  if (valor.includes('IMAX')) return 'IMAX';
  if (valor.includes('VIP')) return 'VIP';
  if (valor.includes('3D')) return '3D';
  return '2D';
}

function mapEstadoPelicula(estado?: string): Pelicula['estado'] {
  const valor = normalizar(estado);
  if (valor === 'PROXIMAMENTE') return 'PROXIMAMENTE';
  if (valor === 'INACTIVO' || valor === 'INACTIVA') return 'INACTIVA';
  return 'CARTELERA';
}

function mapEstadoButaca(dto: FuncionButacaDTO): FuncionButaca['estado'] {
  const estado = normalizar(dto.estadoDisponibilidad);
  if (estado.includes('OCUP') || estado.includes('VEND') || estado.includes('RESERV')) {
    return 'OCUPADA';
  }
  if (estado.includes('BLOQ') && !dto.bloqueadaExpirada) {
    return 'BLOQUEADA';
  }
  return 'DISPONIBLE';
}

export function mapPeliculaDtoToDomain(dto: PeliculaDTO): Pelicula {
  const poster = dto.posterUrl || POSTER_FALLBACK;
  return {
    id: dto.idPelicula,
    titulo: dto.titulo,
    sinopsis: dto.sinopsis,
    duracionMinutos: Number(dto.duracionMinutos ?? 0),
    clasificacion: dto.clasificacion,
    genero: dto.genero,
    posterUrl: poster,
    backdropUrl: poster,
    estado: mapEstadoPelicula(dto.estado),
    formatoDestacado: 'IMAX',
  };
}

export function mapFuncionHorarioDtoToDomain(dto: FuncionHorarioDTO): FuncionHorario {
  return {
    id: dto.idFuncion,
    peliculaId: dto.idPelicula,
    sala: {
      id: dto.idSala,
      nombre: dto.nombreSala || 'Sala Principal',
      capacidadTotal: CAPACIDAD_POR_DEFECTO,
      tipoSala: inferirTipoSala(dto.nombreSala, dto.formato),
      filas: FILAS_POR_DEFECTO,
      columnas: COLUMNAS_POR_DEFECTO,
    },
    fechaHoraInicio: dto.fechaHoraInicio,
    fechaHoraFin: dto.fechaHoraFin,
    idioma: normalizar(dto.version).includes('DOB') ? 'DOBLADA' : 'SUBTITULADA',
    formato: mapFormato(dto.formato),
    precioBase: Number(dto.precioBase ?? PRECIO_BASE_POR_DEFECTO),
  };
}

export function mapFuncionButacaDtoToDomain(
  dto: FuncionButacaDTO,
  funcionHorarioId: number,
  precioBase = PRECIO_BASE_POR_DEFECTO,
): FuncionButaca {
  const tipo = mapTipoButaca(dto.tipoButaca);
  const butaca: Butaca = {
    id: dto.idButaca,
    salaId: 0,
    fila: dto.fila,
    numero: dto.numero,
    codigo: dto.codigoButaca || `${dto.fila}-${dto.numero}`,
    tipo,
  };
  return {
    id: dto.idFuncionButaca,
    funcionHorarioId,
    butaca,
    estado: mapEstadoButaca(dto),
    precioFinal: Number((tipo === 'VIP' ? precioBase + RECARGO_VIP : precioBase).toFixed(2)),
    bloqueadoHasta: dto.bloqueadoHasta,
  };
}

export function mapBloqueoDtoToDomain(dto: BloqueoResponseDTO, totalEstimado = 0): BloqueoResponse {
  return {
    funcionHorarioId: dto.idFuncion,
    butacasBloqueadas: dto.butacasBloqueadas ?? [],
    expiraEn: dto.expiraEn,
    totalEstimado,
  };
}
