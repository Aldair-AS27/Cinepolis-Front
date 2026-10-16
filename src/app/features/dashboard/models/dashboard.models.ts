import { Pelicula } from '../../movies/models/pelicula.model';
import { FuncionHorario } from '../../booking/models/funcion-horario.model';
import { FuncionButaca } from '../../booking/models/funcion-butaca.model';
import { Sala } from '../../../core/models/cinema-domain.models';

// ============================================================================
// Modelos del dashboard: combinan datos de la DB (películas, funciones,
// butacas y salas) para calcular estadísticas en vivo.
// ============================================================================

export interface FuncionDetallada {
  funcion: FuncionHorario;
  butacas: FuncionButaca[];
}

export interface PeliculaDetallada {
  pelicula: Pelicula;
  funciones: FuncionDetallada[];
}

export interface SalaInfo {
  id: number;
  nombre: string;
  tipo: Sala['tipoSala'];
  estado: string;
}

export interface DatosDashboard {
  peliculas: PeliculaDetallada[];
  salas: SalaInfo[];
}
