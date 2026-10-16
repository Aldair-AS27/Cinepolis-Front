import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { DashboardService } from '../../services/dashboard.service';
import { DatosDashboard, PeliculaDetallada } from '../../models/dashboard.models';
import { FuncionHorario } from '../../../booking/models/funcion-horario.model';
import {
  ConteoEstadistica,
  EstadisticaPelicula,
  EstadisticaSala,
  EstadisticasGenerales,
  claveDia,
  estadisticaPelicula,
  estadisticasGenerales,
  estadisticasSalas,
  etiquetaDia,
} from '../../utils/dashboard-stats';
import { DurationPipe } from '../../../../shared/pipes/duration-pipe';
import { CurrencyPipe } from '../../../../shared/pipes/currency-pipe';
import { BadgeSala } from '../../../../shared/ui/badge-sala/badge-sala';
import { SkeletonLoader } from '../../../../shared/ui/skeleton-loader/skeleton-loader';

export type FiltroDia = 'TODOS' | 'HOY' | 'MANANA';

export interface AgendaDia {
  clave: string;
  etiqueta: string;
  funciones: FuncionHorario[];
}

export interface AgendaGrupo {
  pelicula: PeliculaDetallada['pelicula'];
  dias: AgendaDia[];
}

export interface DistribucionDashboard {
  titulo: string;
  items: ConteoEstadistica[];
}

const MS_DIA = 86_400_000;

function construirAgenda(items: readonly PeliculaDetallada[]): AgendaGrupo[] {
  return items
    .filter((item) => item.funciones.length > 0)
    .map((item) => {
      const porDia = new Map<string, FuncionHorario[]>();

      for (const detalle of item.funciones) {
        const clave = claveDia(new Date(detalle.funcion.fechaHoraInicio));
        const lista = porDia.get(clave) ?? [];
        lista.push(detalle.funcion);
        porDia.set(clave, lista);
      }

      const dias: AgendaDia[] = [...porDia.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([clave, funciones]) => ({
          clave,
          etiqueta: etiquetaDia(clave),
          funciones: [...funciones].sort((a, b) =>
            a.fechaHoraInicio.localeCompare(b.fechaHoraInicio),
          ),
        }));

      return { pelicula: item.pelicula, dias };
    })
    .sort(
      (a, b) =>
        a.dias[0].clave.localeCompare(b.dias[0].clave) ||
        a.pelicula.titulo.localeCompare(b.pelicula.titulo),
    );
}

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePipe, RouterLink, DurationPipe, CurrencyPipe, BadgeSala, SkeletonLoader],
  templateUrl: './dashboard-page.html',
  styleUrl: './dashboard-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private readonly dashboardService = inject(DashboardService);
  private readonly router = inject(Router);

  readonly cargando = signal(true);
  readonly error = signal<string | null>(null);
  readonly filtroDia = signal<FiltroDia>('TODOS');

  readonly opcionesDia: ReadonlyArray<{ valor: FiltroDia; etiqueta: string }> = [
    { valor: 'TODOS', etiqueta: 'Todos' },
    { valor: 'HOY', etiqueta: 'Hoy' },
    { valor: 'MANANA', etiqueta: 'Mañana' },
  ];

  private readonly datos = signal<DatosDashboard | null>(null);

  readonly general = computed<EstadisticasGenerales | null>(() => {
    const datos = this.datos();
    return datos ? estadisticasGenerales(datos) : null;
  });

  readonly distribuciones = computed<DistribucionDashboard[]>(() => {
    const resumen = this.general();
    if (!resumen) return [];

    return [
      { titulo: 'Películas por género', items: resumen.peliculasPorGenero },
      { titulo: 'Películas por estado', items: resumen.peliculasPorEstado },
      { titulo: 'Funciones por formato', items: resumen.funcionesPorFormato },
      { titulo: 'Funciones por idioma', items: resumen.funcionesPorIdioma },
    ];
  });

  readonly estadisticasPeliculas = computed<EstadisticaPelicula[]>(() => {
    const datos = this.datos();
    if (!datos) return [];

    return datos.peliculas
      .map(estadisticaPelicula)
      .sort(
        (a, b) =>
          b.ingresosEstimados - a.ingresosEstimados ||
          b.ocupacion - a.ocupacion ||
          a.pelicula.titulo.localeCompare(b.pelicula.titulo),
      );
  });

  readonly estadisticasSalas = computed<EstadisticaSala[]>(() => {
    const datos = this.datos();
    return datos ? estadisticasSalas(datos) : [];
  });

  private readonly agendaCompleta = computed<AgendaGrupo[]>(() => {
    const datos = this.datos();
    return datos ? construirAgenda(datos.peliculas) : [];
  });

  readonly agenda = computed<AgendaGrupo[]>(() => {
    const filtro = this.filtroDia();
    if (filtro === 'TODOS') {
      return this.agendaCompleta();
    }

    const clave =
      filtro === 'HOY' ? claveDia(new Date()) : claveDia(new Date(Date.now() + MS_DIA));

    return this.agendaCompleta()
      .map((grupo) => ({
        pelicula: grupo.pelicula,
        dias: grupo.dias.filter((dia) => dia.clave === clave),
      }))
      .filter((grupo) => grupo.dias.length > 0);
  });

  readonly totalFunciones = computed(() =>
    this.agenda().reduce(
      (total, grupo) => total + grupo.dias.reduce((suma, dia) => suma + dia.funciones.length, 0),
      0,
    ),
  );

  readonly totalSalas = computed(() => {
    const salas = new Set<string>();
    for (const grupo of this.agenda()) {
      for (const dia of grupo.dias) {
        for (const funcion of dia.funciones) {
          salas.add(funcion.sala.nombre);
        }
      }
    }
    return salas.size;
  });

  constructor() {
    this.cargarDashboard();
  }

  reservar(funcion: FuncionHorario): void {
    void this.router.navigate(['/reserva', funcion.id]);
  }

  private cargarDashboard(): void {
    this.cargando.set(true);
    this.error.set(null);

    this.dashboardService.cargarDashboard().subscribe({
      next: (datos) => {
        this.datos.set(datos);
        this.cargando.set(false);
      },
      error: () => {
        this.error.set(
          'No pudimos cargar las estadísticas del cine. Intenta nuevamente en unos segundos.',
        );
        this.cargando.set(false);
      },
    });
  }
}
