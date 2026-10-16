import { FuncionButaca } from '../../booking/models/funcion-butaca.model';
import { FuncionHorario } from '../../booking/models/funcion-horario.model';
import { Pelicula } from '../../movies/models/pelicula.model';
import { DatosDashboard } from '../models/dashboard.models';
import { estadisticaPelicula, estadisticasGenerales, estadisticasSalas } from './dashboard-stats';

const HORA = 3_600_000;

function crearButaca(
  id: number,
  estado: FuncionButaca['estado'],
  precioFinal: number,
): FuncionButaca {
  return {
    id,
    funcionHorarioId: 1,
    butaca: { id, salaId: 1, fila: 'A', numero: id, codigo: `A-${id}`, tipo: 'ESTANDAR' },
    estado,
    precioFinal,
  };
}

function crearFuncion(
  id: number,
  sala: { id: number; nombre: string; tipo: 'IMAX' | 'VIP' },
  inicio: string,
  formato: FuncionHorario['formato'],
  idioma: FuncionHorario['idioma'],
  precioBase: number,
): FuncionHorario {
  return {
    id,
    peliculaId: 1,
    sala: {
      id: sala.id,
      nombre: sala.nombre,
      capacidadTotal: 80,
      tipoSala: sala.tipo,
      filas: 8,
      columnas: 10,
    },
    fechaHoraInicio: inicio,
    fechaHoraFin: new Date(new Date(inicio).getTime() + 2 * HORA).toISOString(),
    idioma,
    formato,
    precioBase,
  };
}

const SALA_IMAX = { id: 1, nombre: 'Sala 01 IMAX', tipo: 'IMAX' as const };
const SALA_VIP = { id: 2, nombre: 'Sala 02 VIP', tipo: 'VIP' as const };

const PELICULA_A: Pelicula = {
  id: 1,
  titulo: 'Acción Total',
  sinopsis: 'Sinopsis A',
  duracionMinutos: 120,
  clasificacion: 'B15',
  genero: 'Acción',
  posterUrl: 'https://images.unsplash.com/a',
  backdropUrl: 'https://images.unsplash.com/a',
  estado: 'CARTELERA',
  formatoDestacado: 'IMAX',
};

const PELICULA_B: Pelicula = {
  id: 2,
  titulo: 'Terror Nocturno',
  sinopsis: 'Sinopsis B',
  duracionMinutos: 90,
  clasificacion: 'C',
  genero: 'Terror',
  posterUrl: 'https://images.unsplash.com/b',
  backdropUrl: 'https://images.unsplash.com/b',
  estado: 'PROXIMAMENTE',
  formatoDestacado: 'IMAX',
};

const FUNCION_1 = crearFuncion(
  101,
  SALA_IMAX,
  new Date(Date.now() + HORA).toISOString(),
  '2D',
  'SUBTITULADA',
  20,
);

const FUNCION_2 = crearFuncion(
  201,
  SALA_VIP,
  new Date(Date.now() + 24 * HORA).toISOString(),
  'VIP',
  'DOBLADA',
  30,
);

const DATOS: DatosDashboard = {
  salas: [
    { id: 1, nombre: 'Sala 01 IMAX', tipo: 'IMAX', estado: 'ACTIVA' },
    { id: 2, nombre: 'Sala 02 VIP', tipo: 'VIP', estado: 'ACTIVA' },
    { id: 3, nombre: 'Sala 03 Junior', tipo: 'JUNIOR', estado: 'ACTIVA' },
  ],
  peliculas: [
    {
      pelicula: PELICULA_A,
      funciones: [
        {
          funcion: FUNCION_1,
          butacas: [
            crearButaca(1, 'OCUPADA', 20),
            crearButaca(2, 'BLOQUEADA', 20),
            crearButaca(3, 'DISPONIBLE', 20),
            crearButaca(4, 'DISPONIBLE', 20),
          ],
        },
        {
          funcion: FUNCION_2,
          butacas: [crearButaca(5, 'OCUPADA', 42), crearButaca(6, 'DISPONIBLE', 42)],
        },
      ],
    },
    { pelicula: PELICULA_B, funciones: [] },
  ],
};

describe('estadisticasGenerales', () => {
  const resumen = estadisticasGenerales(DATOS);

  it('agrega películas, funciones y duraciones', () => {
    expect(resumen.totalPeliculas).toBe(2);
    expect(resumen.enCartelera).toBe(1);
    expect(resumen.proximamente).toBe(1);
    expect(resumen.inactivas).toBe(0);
    expect(resumen.totalFunciones).toBe(2);
    expect(resumen.funcionesFuturas).toBe(2);
    expect(resumen.totalSalas).toBe(3);
    expect(resumen.salasEnUso).toBe(2);
    expect(resumen.duracionPromedio).toBe(105);
    expect(resumen.duracionMinima).toBe(90);
    expect(resumen.duracionMaxima).toBe(120);
  });

  it('agrega butacas, ocupación e ingresos estimados', () => {
    expect(resumen.totalButacas).toBe(6);
    expect(resumen.butacasOcupadas).toBe(2);
    expect(resumen.butacasBloqueadas).toBe(1);
    expect(resumen.butacasDisponibles).toBe(3);
    expect(resumen.ocupacionGlobal).toBe(33.3);
    expect(resumen.ingresosEstimados).toBe(62);
  });

  it('construye distribuciones con totales y porcentajes', () => {
    expect(resumen.peliculasPorGenero.map((conteo) => conteo.etiqueta)).toEqual([
      'Acción',
      'Terror',
    ]);
    expect(resumen.peliculasPorGenero[0].porcentaje).toBe(50);
    expect(resumen.funcionesPorFormato).toEqual([
      { etiqueta: '2D', total: 1, porcentaje: 50 },
      { etiqueta: 'VIP', total: 1, porcentaje: 50 },
    ]);
    expect(resumen.funcionesPorIdioma.reduce((total, conteo) => total + conteo.total, 0)).toBe(2);
  });
});

describe('estadisticaPelicula', () => {
  it('calcula métricas completas por película', () => {
    const estadistica = estadisticaPelicula(DATOS.peliculas[0]);

    expect(estadistica.totalFunciones).toBe(2);
    expect(estadistica.salas).toEqual(['Sala 01 IMAX', 'Sala 02 VIP']);
    expect(estadistica.formatos).toEqual(['2D', 'VIP']);
    expect(estadistica.idiomas).toEqual(['SUBTITULADA', 'DOBLADA']);
    expect(estadistica.totalButacas).toBe(6);
    expect(estadistica.ocupadas).toBe(2);
    expect(estadistica.bloqueadas).toBe(1);
    expect(estadistica.disponibles).toBe(3);
    expect(estadistica.ocupacion).toBe(33.3);
    expect(estadistica.ingresosEstimados).toBe(62);
    expect(estadistica.proximaFuncion).toBe(FUNCION_1.fechaHoraInicio);
  });

  it('devuelve ceros para películas sin funciones', () => {
    const estadistica = estadisticaPelicula(DATOS.peliculas[1]);

    expect(estadistica.totalFunciones).toBe(0);
    expect(estadistica.totalButacas).toBe(0);
    expect(estadistica.ocupacion).toBe(0);
    expect(estadistica.ingresosEstimados).toBe(0);
    expect(estadistica.proximaFuncion).toBeNull();
  });
});

describe('estadisticasSalas', () => {
  const salas = estadisticasSalas(DATOS);

  it('incluye el catálogo completo de la DB y ordena por actividad', () => {
    expect(salas.map((estadistica) => estadistica.sala.id)).toEqual([2, 1, 3]);
  });

  it('agrega funciones, butacas y ocupación por sala', () => {
    const vip = salas[0];
    expect(vip.totalFunciones).toBe(1);
    expect(vip.peliculas).toBe(1);
    expect(vip.totalButacas).toBe(2);
    expect(vip.ocupadas).toBe(1);
    expect(vip.ocupacion).toBe(50);
    expect(vip.proximaFuncion).toBe(FUNCION_2.fechaHoraInicio);

    const imax = salas[1];
    expect(imax.totalFunciones).toBe(1);
    expect(imax.totalButacas).toBe(4);
    expect(imax.ocupacion).toBe(25);

    const junior = salas[2];
    expect(junior.totalFunciones).toBe(0);
    expect(junior.ocupacion).toBe(0);
    expect(junior.proximaFuncion).toBeNull();
  });
});
