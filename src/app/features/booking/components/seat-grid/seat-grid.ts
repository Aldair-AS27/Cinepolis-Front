import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import { FuncionButaca } from '../../models/funcion-butaca.model';

interface FilaButacas {
  fila: string;
  butacas: FuncionButaca[];
}

const CLASE_BASE =
  'relative flex h-9 w-9 items-center justify-center rounded-t-xl border text-[11px] font-semibold transition-all duration-200';

@Component({
  selector: 'app-seat-grid',
  imports: [],
  templateUrl: './seat-grid.html',
  styleUrl: './seat-grid.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SeatGrid {
  readonly butacas = input.required<FuncionButaca[]>();
  readonly seleccionadas = input<FuncionButaca[]>([]);
  readonly butacaToggle = output<FuncionButaca>();

  readonly filas = computed<FilaButacas[]>(() => {
    const mapa = new Map<string, FuncionButaca[]>();

    for (const item of this.butacas()) {
      const lista = mapa.get(item.butaca.fila) ?? [];
      lista.push(item);
      mapa.set(item.butaca.fila, lista);
    }

    return [...mapa.entries()]
      .map(([fila, butacas]) => ({
        fila,
        butacas: [...butacas].sort((a, b) => a.butaca.numero - b.butaca.numero),
      }))
      .sort((a, b) => a.fila.localeCompare(b.fila));
  });

  readonly idsSeleccionados = computed(
    () => new Set(this.seleccionadas().map((item) => item.id)),
  );

  seleccionable(item: FuncionButaca): boolean {
    return item.estado !== 'OCUPADA' && item.estado !== 'BLOQUEADA';
  }

  claseButaca(item: FuncionButaca): string {
    if (this.idsSeleccionados().has(item.id)) {
      return `${CLASE_BASE} scale-110 border-gold bg-gold text-cinepolis-bg shadow-gold-glow`;
    }

    if (item.estado === 'OCUPADA') {
      return `${CLASE_BASE} cursor-not-allowed border-transparent bg-slate-800/50 text-slate-600`;
    }

    if (item.estado === 'BLOQUEADA') {
      return `${CLASE_BASE} cursor-not-allowed border-amber-500/40 bg-amber-900/40 text-amber-200/60`;
    }

    if (item.butaca.tipo === 'VIP') {
      return `${CLASE_BASE} border-gold/60 bg-cinepolis-royal/80 text-gold-light hover:border-gold hover:shadow-gold-glow`;
    }

    if (item.butaca.tipo === 'DISCAPACITADO') {
      return `${CLASE_BASE} border-sky-400/50 bg-sky-900/30 text-sky-200 hover:border-sky-300 hover:shadow-screen-glow`;
    }

    return `${CLASE_BASE} border-white/10 bg-cinepolis-royal/80 text-slate-300 hover:border-gold hover:text-gold-light`;
  }

  toggle(item: FuncionButaca): void {
    if (this.seleccionable(item)) {
      this.butacaToggle.emit(item);
    }
  }
}
