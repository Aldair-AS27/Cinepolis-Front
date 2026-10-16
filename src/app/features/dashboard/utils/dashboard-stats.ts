import { FuncionButaca } from '../../booking/models/funcion-butaca.model';
import { FuncionHorario } from '../../booking/models/funcion-horario.model';
import { Pelicula } from '../../movies/models/pelicula.model';
import { DatosDashboard, PeliculaDetallada, SalaInfo } from '../models/dashboard.models';

// ============================================================================
// Cálculo puro de estadísticas a partir de los datos reales de la DB.
// ============================================================================

export interface ConteoEstadistica {
  etiqueta: string;
  total: number;
  porcentaje: number;
}

export interface EstadisticasGenerales {
  totalPeliculas: number;
  enCartelera: number;
  proximamente: number;
  inactivas: number;
  totalFunciones: number;
  funcionesHoy: number;
  funcionesFuturas: number;
  totalSalas: number;
  salasEnUso: number;
  duracionPromedio: number;
  duracionMinima: number;
  duracionMaxima: number;
  totalButacas: number;
  butacasOcupadas: number;
  butacasBloqueadas: number;
  butacasDisponibles: number;
  ocupacionGlobal: number;
  ingresosEstimados: number;
  peliculasPorGenero: ConteoEstadistica[];
  peliculasPorEstado: ConteoEstadistica[];
  peliculasPorClasificacion: ConteoEstadistica[];
  funcionesPorFormato: ConteoEstadistica[];
  funcionesPorIdioma: ConteoEstadistica[];
}

export interface EstadisticaPelicula {
  pelicula: Pelicula;
  totalFunciones: number;
  salas: string[];
  formatos: string[];
  idiomas: string[];
  totalButacas: number;
  ocupadas: number;
  bloqueadas: number;
  disponibles: number;
  ocupacion: number;
  ingresosEstimados: number;
  proximaFuncion: string | null;
}

export interface EstadisticaSala {
  sala: SalaInfo;
  totalFunciones: number;
  peliculas: number;
  totalButacas: number;
  ocupadas: number;
  ocupacion: number;
  proximaFuncion: string | null;
}

const MS_DIA = 86_400_000;
const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

export function claveDia(fecha: Date): string {
  return `${fecha.getFullYear()}-${fecha.getMonth() + 1}-${fecha.getDate()}`;
}

export function etiquetaDia(clave: string): string {
  if (clave === claveDia(new Date())) return 'Hoy';
  if (clave === claveDia(new Date(Date.now() + MS_DIA))) return 'Mañana';
  const [, mes, dia] = clave.split('-').map(Number);
  return `${dia} ${MESES[mes - 1]}`;
}

function porcentaje(parte: number, total: number): number {
  return total === 0 ? 0 : Math.round((parte / total) * 1000) / 10;
}

function redondear(valor: number): number {
  return Math.round(valor * 100) / 100;
}

function contar(valores: readonly string[]): ConteoEstadistica[] {
  const mapa = new Map<string, number>();
  for (const valor of valores) {
    mapa.set(valor, (mapa.get(valor) ?? 0) + 1);
  }
  const total = valores.length;
  return [...mapa.entries()]
    .map(([etiqueta, conteo]) => ({
      etiqueta,
      total: conteo,
      porcentaje: porcentaje(conteo, total),
    }))
    .sort((a, b) => b.total - a.total || a.etiqueta.localeCompare(b.etiqueta));
}

function proximaDe(funciones: readonly FuncionHorario[]): string | null {
  const ahora = Date.now();
  const proxima = [...funciones]
    .sort((a, b) => a.fechaHoraInicio.localeCompare(b.fechaHoraInicio))
    .find((funcion) => new Date(funcion.fechaHoraInicio).getTime() >= ahora);
  return proxima?.fechaHoraInicio ?? null;
}

export function estadisticaPelicula(item: PeliculaDetallada): EstadisticaPelicula {
  const butacas = item.funciones.flatMap((detalle) => detalle.butacas);
  const ocupadas = butacas.filter((butaca) => butaca.estado === 'OCUPADA');
  const bloqueadas = butacas.filter((butaca) => butaca.estado === 'BLOQUEADA');
  const disponibles = butacas.filter((butaca) => butaca.estado === 'DISPONIBLE');
  const funciones = item.funciones.map((detalle) => detalle.funcion);

  return {
    pelicula: item.pelicula,
    totalFunciones: funciones.length,
    salas: [...new Set(funciones.map((funcion) => funcion.sala.nombre))],
    formatos: [...new Set(funciones.map((funcion) => funcion.formato))],
    idiomas: [...new Set(funciones.map((funcion) => funcion.idioma))],
    totalButacas: butacas.length,
    ocupadas: ocupadas.length,
    bloqueadas: bloqueadas.length,
    disponibles: disponibles.length,
    ocupacion: porcentaje(ocupadas.length, butacas.length),
    ingresosEstimados: redondear(
      ocupadas.reduce((total, butaca) => total + butaca.precioFinal, 0),
    ),
    proximaFuncion: proximaDe(funciones),
  };
}

export function estadisticasGenerales(datos: DatosDashboard): EstadisticasGenerales {
  const funciones = datos.peliculas.flatMap((item) =>
    item.funciones.map((detalle) => detalle.funcion),
  );
  const butacas = datos.peliculas.flatMap((item) =>
    item.funciones.flatMap((detalle) => detalle.butacas),
  );
  const ocupadas = butacas.filter((butaca) => butaca.estado === 'OCUPADA');
  const bloqueadas = butacas.filter((butaca) => butaca.estado === 'BLOQUEADA');
  const disponibles = butacas.filter((butaca) => butaca.estado === 'DISPONIBLE');

  const duraciones = datos.peliculas
    .map((item) => item.pelicula.duracionMinutos)
    .filter((duracion) => duracion > 0);

  const ahora = Date.now();
  const claveHoy = claveDia(new Date());
  const estados = datos.peliculas.map((item) => item.pelicula.estado);

  return {
    totalPeliculas: datos.peliculas.length,
    enCartelera: estados.filter((estado) => estado === 'CARTELERA').length,
    proximamente: estados.filter((estado) => estado === 'PROXIMAMENTE').length,
    inactivas: estados.filter((estado) => estado === 'INACTIVA').length,
    totalFunciones: funciones.length,
    funcionesHoy: funciones.filter(
      (funcion) => claveDia(new Date(funcion.fechaHoraInicio)) === claveHoy,
    ).length,
    funcionesFuturas: funciones.filter(
      (funcion) => new Date(funcion.fechaHoraInicio).getTime() >= ahora,
    ).length,
    totalSalas: datos.salas.length,
    salasEnUso: new Set(funciones.map((funcion) => funcion.sala.nombre)).size,
    duracionPromedio: duraciones.length
      ? Math.round(duraciones.reduce((total, duracion) => total + duracion, 0) / duraciones.length)
      : 0,
    duracionMinima: duraciones.length ? Math.min(...duraciones) : 0,
    duracionMaxima: duraciones.length ? Math.max(...duraciones) : 0,
    totalButacas: butacas.length,
    butacasOcupadas: ocupadas.length,
    butacasBloqueadas: bloqueadas.length,
    butacasDisponibles: disponibles.length,
    ocupacionGlobal: porcentaje(ocupadas.length, butacas.length),
    ingresosEstimados: redondear(
      ocupadas.reduce((total, butaca) => total + butaca.precioFinal, 0),
    ),
    peliculasPorGenero: contar(datos.peliculas.map((item) => item.pelicula.genero)),
    peliculasPorEstado: contar(estados),
    peliculasPorClasificacion: contar(
      datos.peliculas.map((item) => item.pelicula.clasificacion),
    ),
    funcionesPorFormato: contar(funciones.map((funcion) => funcion.formato)),
    funcionesPorIdioma: contar(funciones.map((funcion) => funcion.idioma)),
  };
}

export function estadisticasSalas(datos: DatosDashboard): EstadisticaSala[] {
  const catalogo = new Map<number, SalaInfo>(datos.salas.map((sala) => [sala.id, sala]));
  const acumulado = new Map<
    number,
    { funciones: FuncionHorario[]; butacas: FuncionButaca[]; titulos: Set<string> }
  >();

  for (const item of datos.peliculas) {
    for (const detalle of item.funciones) {
      const idSala = detalle.funcion.sala.id;
      let entrada = acumulado.get(idSala);
      if (!entrada) {
        entrada = { funciones: [], butacas: [], titulos: new Set<string>() };
        acumulado.set(idSala, entrada);
        if (!catalogo.has(idSala)) {
          catalogo.set(idSala, {
            id: idSala,
            nombre: detalle.funcion.sala.nombre,
            tipo: detalle.funcion.sala.tipoSala,
            estado: 'ACTIVA',
          });
        }
      }
      entrada.funciones.push(detalle.funcion);
      entrada.butacas.push(...detalle.butacas);
      entrada.titulos.add(item.pelicula.titulo);
    }
  }

  return [...catalogo.values()]
    .map((sala) => {
      const entrada = acumulado.get(sala.id);
      const butacas = entrada?.butacas ?? [];
      const ocupadas = butacas.filter((butaca) => butaca.estado === 'OCUPADA').length;

      return {
        sala,
        totalFunciones: entrada?.funciones.length ?? 0,
        peliculas: entrada?.titulos.size ?? 0,
        totalButacas: butacas.length,
        ocupadas,
        ocupacion: porcentaje(ocupadas, butacas.length),
        proximaFuncion: entrada ? proximaDe(entrada.funciones) : null,
      };
    })
    .sort(
      (a, b) =>
        b.totalFunciones - a.totalFunciones ||
        b.ocupacion - a.ocupacion ||
        a.sala.nombre.localeCompare(b.sala.nombre),
    );
}
