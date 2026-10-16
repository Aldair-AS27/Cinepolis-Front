import { computed, Injectable, signal } from '@angular/core';
import {
  FuncionButaca,
  FuncionHorario,
} from '../../../core/models/cinema-domain.models';

const MAX_BOLETOS = 8;

/**
 * Estado reactivo (100% Signals) de la selección de butacas de una función.
 */
@Injectable({ providedIn: 'root' })
export class ButacaStateService {
  readonly maxBoletos = MAX_BOLETOS;

  private readonly _funcionActual = signal<FuncionHorario | null>(null);
  private readonly _mapaButacas = signal<FuncionButaca[]>([]);
  private readonly _seleccionadas = signal<FuncionButaca[]>([]);

  readonly funcionActual = this._funcionActual.asReadonly();
  readonly mapaButacas = this._mapaButacas.asReadonly();
  readonly seleccionadas = this._seleccionadas.asReadonly();

  readonly totalBoletos = computed(() => this._seleccionadas().length);

  readonly subtotal = computed(() =>
    this._seleccionadas().reduce((total, item) => total + item.precioFinal, 0),
  );

  readonly codigosSeleccionados = computed(() =>
    this._seleccionadas().map((item) => item.butaca.codigo),
  );

  readonly puedeAgregarMas = computed(() => this.totalBoletos() < MAX_BOLETOS);

  /** Prepara una nueva función y limpia cualquier selección previa. */
  iniciar(funcion: FuncionHorario | null, butacas: FuncionButaca[] = []): void {
    this._funcionActual.set(funcion);
    this._mapaButacas.set(butacas);
    this._seleccionadas.set([]);
  }

  /** Alterna una butaca aplicando las reglas de negocio de selección. */
  toggleButaca(item: FuncionButaca): void {
    if (item.estado === 'OCUPADA' || item.estado === 'BLOQUEADA') {
      return;
    }

    const actuales = this._seleccionadas();
    const yaSeleccionada = actuales.some((seleccionada) => seleccionada.id === item.id);

    if (yaSeleccionada) {
      this._seleccionadas.set(actuales.filter((seleccionada) => seleccionada.id !== item.id));
      return;
    }

    if (actuales.length >= MAX_BOLETOS) {
      return;
    }

    this._seleccionadas.set([...actuales, item]);
  }

  limpiarSeleccion(): void {
    this._seleccionadas.set([]);
  }

  estaSeleccionada(butacaId: number): boolean {
    return this._seleccionadas().some((item) => item.id === butacaId);
  }
}
