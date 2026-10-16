import { HttpErrorResponse, HttpInterceptorFn, HttpResponse } from '@angular/common/http';
import { delay, Observable, of, throwError } from 'rxjs';
import {
  ApiResponse,
  BloqueoResponseDTO,
  BloquearButacasRequestDTO,
  FuncionButacaDTO,
  FuncionHorarioDTO,
  PeliculaDTO,
  SalaDTO,
} from '../models/cinema-domain.models';

// ============================================================================
// Backend simulado en memoria: responde /api/** con ApiResponse<T> y delay(250)
// devolviendo DTOs idénticos a los de Swagger (Railway). Los servicios reales
// los mapean a dominio con cinema-mappers.ts, por lo que el mock valida todo
// el pipeline de la capa de datos.
// ============================================================================

const UNSPLASH = '?auto=format&fit=crop&q=80';

const PELICULAS: readonly PeliculaDTO[] = [
  {
    idPelicula: 1,
    titulo: 'El Último Horizonte',
    sinopsis:
      'La tripulación del Odisea VII despierta a años luz de casa con un mensaje imposible: alguien en la Tierra los espera. Un viaje interestelar sobre la memoria, el sacrificio y lo que significa volver.',
    duracionMinutos: 148,
    clasificacion: 'B15',
    genero: 'Ciencia Ficción',
    posterUrl: `https://images.unsplash.com/photo-1446776811953-b23d57bd21aa${UNSPLASH}&w=800&h=1200`,
    estado: 'CARTELERA',
  },
  {
    idPelicula: 2,
    titulo: 'Ciudad de Neón',
    sinopsis:
      'En una metrópolis donde los recuerdos se venden en la calle, un detective con amnesia persigue a la única testigo capaz de reconstruir su pasado antes del amanecer.',
    duracionMinutos: 122,
    clasificacion: 'B14',
    genero: 'Thriller',
    posterUrl: `https://images.unsplash.com/photo-1534796636912-3b95b3ab5986${UNSPLASH}&w=800&h=1200`,
    estado: 'CARTELERA',
  },
  {
    idPelicula: 3,
    titulo: 'Sombras de Marte',
    sinopsis:
      'La primera colonia marciana pierde contacto con la Tierra. Una ingeniera deberá reparar el generador que mantiene con vida a 300 colonos usando solo piezas recicladas y una intuición inquebrantable.',
    duracionMinutos: 156,
    clasificacion: 'B15',
    genero: 'Aventura',
    posterUrl: `https://images.unsplash.com/photo-1502134249126-9f3755a50d78${UNSPLASH}&w=800&h=1200`,
    estado: 'CARTELERA',
  },
  {
    idPelicula: 4,
    titulo: 'Ruta Salvaje: Eclipse',
    sinopsis:
      'Dos hermanos cruzan el continente en un muscle car restaurado para ver el eclipse total de sol. Una carrera contra el tiempo, la ley y sus propios fantasmas.',
    duracionMinutos: 118,
    clasificacion: 'B14',
    genero: 'Acción',
    posterUrl: `https://images.unsplash.com/photo-1506905925346-21bda4d32df4${UNSPLASH}&w=800&h=1200`,
    estado: 'CARTELERA',
  },
  {
    idPelicula: 5,
    titulo: 'La Casa del Silencio',
    sinopsis:
      'Una familia hereda una casona victoriana donde cada habitación guarda una grabación. Escucharlas en orden es la única forma de salir.',
    duracionMinutos: 104,
    clasificacion: 'C',
    genero: 'Terror',
    posterUrl: `https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c${UNSPLASH}&w=800&h=1200`,
    estado: 'PROXIMAMENTE',
  },
  {
    idPelicula: 6,
    titulo: 'El Reino de Cristal',
    sinopsis:
      'Una cartógrafa diminuta debe dibujar el mapa de un reino que cambia de forma cada luna llena. Animación hecha a mano sobre cristal iluminado.',
    duracionMinutos: 96,
    clasificacion: 'A',
    genero: 'Animación',
    posterUrl: `https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9${UNSPLASH}&w=800&h=1200`,
    estado: 'PROXIMAMENTE',
  },
];

const SALAS: readonly SalaDTO[] = [
  { idSala: 1, nombreNumero: 'Sala 01 IMAX Laser', tipoSala: 'IMAX', estado: 'ACTIVA' },
  { idSala: 2, nombreNumero: 'Sala 02 VIP Lounge', tipoSala: 'VIP', estado: 'ACTIVA' },
  { idSala: 3, nombreNumero: 'Sala 03 4DX Motion', tipoSala: '4DX', estado: 'ACTIVA' },
  { idSala: 4, nombreNumero: 'Sala 04 Tradicional 3D', tipoSala: 'TRADICIONAL', estado: 'ACTIVA' },
  { idSala: 5, nombreNumero: 'Sala 05 Junior Kids', tipoSala: 'JUNIOR', estado: 'ACTIVA' },
];

const PRECIOS: Record<string, number> = {
  IMAX: 42,
  VIP: 38,
  '4DX': 45,
  TRADICIONAL: 24,
  JUNIOR: 18,
};

const HORAS = [14, 16, 18, 21, 22, 23];
const FORMATOS = ['IMAX', 'VIP', '3D', '2D', 'IMAX', 'VIP'];

function construirFunciones(pelicula: PeliculaDTO): FuncionHorarioDTO[] {
  return HORAS.map((hora, indice) => {
    const sala = SALAS[(pelicula.idPelicula + indice) % SALAS.length];
    const inicio = new Date();
    if (hora >= 22) {
      inicio.setDate(inicio.getDate() + 1);
    }
    inicio.setHours(hora, 0, 0, 0);
    const fin = new Date(inicio.getTime() + pelicula.duracionMinutos * 60_000);
    return {
      idFuncion: pelicula.idPelicula * 100 + indice + 1,
      idPelicula: pelicula.idPelicula,
      tituloPelicula: pelicula.titulo,
      posterUrl: pelicula.posterUrl,
      idSala: sala.idSala,
      nombreSala: sala.nombreNumero,
      fechaHoraInicio: inicio.toISOString(),
      fechaHoraFin: fin.toISOString(),
      formato: FORMATOS[indice],
      version: indice % 2 === 0 ? 'SUB' : 'DOB',
      precioBase: PRECIOS[sala.tipoSala] ?? 25,
      estado: 'ACTIVA',
    };
  });
}

const FUNCIONES: readonly FuncionHorarioDTO[] = PELICULAS.flatMap(construirFunciones);

const FILAS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;
const COLUMNAS = 10;

function tipoDeButaca(fila: string, numero: number): string {
  if (fila === 'G' || fila === 'H') return 'VIP';
  if (fila === 'F' && numero <= 2) return 'DISCAPACITADO';
  return 'ESTANDAR';
}

function construirButacas(funcion: FuncionHorarioDTO): FuncionButacaDTO[] {
  const butacas: FuncionButacaDTO[] = [];
  FILAS.forEach((fila, indiceFila) => {
    for (let numero = 1; numero <= COLUMNAS; numero++) {
      const semilla = funcion.idFuncion * 31 + indiceFila * 11 + numero * 7;
      const ocupada = semilla % 7 === 0;
      const bloqueada = !ocupada && semilla % 19 === 0;
      const id = funcion.idFuncion * 1000 + indiceFila * 10 + numero;
      butacas.push({
        idFuncionButaca: id,
        idButaca: id,
        fila,
        numero,
        codigoButaca: `${fila}-${String(numero).padStart(2, '0')}`,
        tipoButaca: tipoDeButaca(fila, numero),
        estadoDisponibilidad: ocupada ? 'OCUPADA' : bloqueada ? 'BLOQUEADA' : 'DISPONIBLE',
        bloqueadoHasta: bloqueada ? new Date(Date.now() + 9 * 60_000).toISOString() : undefined,
        bloqueadaExpirada: false,
      });
    }
  });
  return butacas;
}

function responder<T>(data: T, message = 'Operación exitosa'): Observable<HttpResponse<ApiResponse<T>>> {
  const body: ApiResponse<T> = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  };
  return of(new HttpResponse<ApiResponse<T>>({ status: 200, body })).pipe(delay(250));
}

function fallo(url: string, status: number, message: string): Observable<never> {
  return throwError(
    () =>
      new HttpErrorResponse({
        status,
        statusText: message,
        url,
        error: { success: false, message, data: null } satisfies ApiResponse<null>,
      }),
  ).pipe(delay(250));
}

export const mockBackendInterceptor: HttpInterceptorFn = (req, next) => {
  const url = req.url.split('?')[0];

  if (!url.startsWith('/api')) {
    return next(req);
  }

  if (req.method === 'GET') {
    if (url === '/api/peliculas') {
      const soloCartelera = req.params.get('todas') === 'false';
      const data = soloCartelera
        ? PELICULAS.filter((p) => p.estado === 'CARTELERA')
        : [...PELICULAS];
      return responder(data, 'Cartelera obtenida');
    }

    if (url === '/api/peliculas/buscar') {
      const q = (req.params.get('q') ?? '').toLowerCase();
      const data = PELICULAS.filter(
        (p) =>
          p.titulo.toLowerCase().includes(q) ||
          p.genero.toLowerCase().includes(q) ||
          p.sinopsis.toLowerCase().includes(q),
      );
      return responder(data, 'Búsqueda realizada');
    }

    const porGenero = /^\/api\/peliculas\/genero\/(.+)$/.exec(url);
    if (porGenero) {
      const genero = decodeURIComponent(porGenero[1]).toLowerCase();
      return responder(
        PELICULAS.filter((p) => p.genero.toLowerCase() === genero),
        'Películas por género',
      );
    }

    const detalle = /^\/api\/peliculas\/(\d+)$/.exec(url);
    if (detalle) {
      const pelicula = PELICULAS.find((p) => p.idPelicula === Number(detalle[1]));
      return pelicula ? responder(pelicula) : fallo(url, 404, 'Película no encontrada');
    }

    if (url === '/api/salas') {
      return responder([...SALAS], 'Salas obtenidas');
    }

    const detalleSala = /^\/api\/salas\/(\d+)$/.exec(url);
    if (detalleSala) {
      const sala = SALAS.find((s) => s.idSala === Number(detalleSala[1]));
      return sala ? responder(sala) : fallo(url, 404, 'Sala no encontrada');
    }

    const porPelicula = /^\/api\/funciones\/pelicula\/(\d+)$/.exec(url);
    if (porPelicula) {
      const peliculaId = Number(porPelicula[1]);
      return responder(
        FUNCIONES.filter((f) => f.idPelicula === peliculaId),
        'Funciones obtenidas',
      );
    }

    const butacas = /^\/api\/funciones\/(\d+)\/butacas$/.exec(url);
    if (butacas) {
      const funcion = FUNCIONES.find((f) => f.idFuncion === Number(butacas[1]));
      return funcion
        ? responder(construirButacas(funcion), 'Mapa de butacas obtenido')
        : fallo(url, 404, 'Función no encontrada');
    }

    const detalleFuncion = /^\/api\/funciones\/(\d+)$/.exec(url);
    if (detalleFuncion) {
      const funcion = FUNCIONES.find((f) => f.idFuncion === Number(detalleFuncion[1]));
      return funcion ? responder(funcion) : fallo(url, 404, 'Función no encontrada');
    }
  }

  if (req.method === 'POST' && url === '/api/funciones/bloquear-butacas') {
    const body = req.body as BloquearButacasRequestDTO | null;
    if (!body || typeof body.idFuncion !== 'number' || !Array.isArray(body.butacaIds) || body.butacaIds.length === 0) {
      return fallo(url, 400, 'Debe indicar al menos una butaca para bloquear');
    }
    const bloqueo: BloqueoResponseDTO = {
      bloqueadoExitoso: true,
      mensaje: 'Asientos bloqueados por 10 minutos',
      idFuncion: body.idFuncion,
      butacasBloqueadas: body.butacaIds,
      expiraEn: new Date(Date.now() + 10 * 60_000).toISOString(),
      segundosRestantes: 600,
    };
    return responder(bloqueo, bloqueo.mensaje);
  }

  const liberar = /^\/api\/funciones\/(\d+)\/liberar-butacas$/.exec(url);
  if (req.method === 'POST' && liberar) {
    const butacaIds = req.body as number[] | null;
    if (!Array.isArray(butacaIds)) {
      return fallo(url, 400, 'Debe enviar el arreglo de butacas a liberar');
    }
    return responder(undefined, 'Butacas liberadas');
  }

  return fallo(url, 404, `Ruta no implementada: ${req.method} ${url}`);
};
