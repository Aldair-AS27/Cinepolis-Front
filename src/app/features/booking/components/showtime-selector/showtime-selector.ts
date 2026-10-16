import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FuncionHorario } from '../../models/funcion-horario.model';
import { BadgeSala } from '../../../../shared/ui/badge-sala/badge-sala';
import { CurrencyPipe } from '../../../../shared/pipes/currency-pipe';

interface GrupoSala {
  sala: string;
  tipoSala: string;
  totalFunciones: number;
  funciones: FuncionHorario[];
}

@Component({
  selector: 'app-showtime-selector',
  imports: [DatePipe, BadgeSala, CurrencyPipe],
  templateUrl: './showtime-selector.html',
  styleUrl: './showtime-selector.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShowtimeSelector {
  readonly funciones = input.required<FuncionHorario[]>();
  readonly seleccion = output<FuncionHorario>();

  readonly seleccionada = signal<number | null>(null);

  readonly grupos = computed<GrupoSala[]>(() => {
    const mapa = new Map<string, FuncionHorario[]>();

    for (const funcion of this.funciones()) {
      const lista = mapa.get(funcion.sala.nombre) ?? [];
      lista.push(funcion);
      mapa.set(funcion.sala.nombre, lista);
    }

    return [...mapa.entries()].map(([sala, funciones]) => ({
      sala,
      tipoSala: funciones[0].sala.tipoSala,
      totalFunciones: funciones.length,
      funciones: [...funciones].sort((a, b) =>
        a.fechaHoraInicio.localeCompare(b.fechaHoraInicio),
      ),
    }));
  });

  seleccionar(funcion: FuncionHorario): void {
    this.seleccionada.set(funcion.id);
    this.seleccion.emit(funcion);
  }
}
