import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { FuncionService } from '../../services/funcion.service';
import { FuncionButaca } from '../../models/funcion-butaca.model';
import { FuncionHorario } from '../../models/funcion-horario.model';
import { BloqueoResponse } from '../../../../core/models/cinema-domain.models';
import { Pelicula } from '../../../movies/models/pelicula.model';
import { GoldButton } from '../../../../shared/ui/gold-button/gold-button';
import { CurrencyPipe } from '../../../../shared/pipes/currency-pipe';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-booking-summary',
  imports: [DatePipe, GoldButton, CurrencyPipe],
  templateUrl: './booking-summary.html',
  styleUrl: './booking-summary.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingSummary implements OnDestroy {
  private readonly funcionService = inject(FuncionService);
  private readonly router = inject(Router);
  private readonly authService = inject(AuthService);

  private readonly tick = signal(0);
  private temporizador?: ReturnType<typeof setInterval>;

  readonly pelicula = input<Pelicula | null>(null);
  readonly funcion = input<FuncionHorario | null>(null);
  readonly seleccionadas = input.required<FuncionButaca[]>();
  readonly maxBoletos = 8;

  readonly procesando = signal(false);
  readonly bloqueo = signal<BloqueoResponse | null>(null);
  readonly error = signal<string | null>(null);

  readonly totalBoletos = computed(() => this.seleccionadas().length);
  readonly codigos = computed(() => this.seleccionadas().map((item) => item.butaca.codigo));
  readonly subtotal = computed(() =>
    this.seleccionadas().reduce((total, item) => total + item.precioFinal, 0),
  );

  readonly segundosRestantes = computed(() => {
    this.tick();
    const bloqueo = this.bloqueo();
    if (!bloqueo) return 0;
    return Math.max(0, Math.ceil((new Date(bloqueo.expiraEn).getTime() - Date.now()) / 1000));
  });

  readonly temporizadorTexto = computed(() => {
    const total = this.segundosRestantes();
    const minutos = Math.floor(total / 60);
    const segundos = total % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  });

  confirmarBloqueo(): void {
    if (!this.authService.isLoggedIn()) {
      this.error.set('Debes iniciar sesión para reservar tus asientos.');
      this.router.navigate(['/login']);
      return;
    }

    const funcion = this.funcion();
    const butacas = this.seleccionadas();
    if (!funcion || butacas.length === 0 || this.procesando()) {
      return;
    }

    this.procesando.set(true);
    this.error.set(null);

    this.funcionService
      .bloquearButacas({
        funcionHorarioId: funcion.id,
        butacaIds: butacas.map((item) => item.butaca.id),
      })
      .subscribe({
        next: (bloqueo) => {
          this.bloqueo.set(bloqueo);
          this.procesando.set(false);
          this.iniciarTemporizador();
        },
        error: () => {
          this.error.set('No pudimos bloquear tus asientos. Intenta nuevamente.');
          this.procesando.set(false);
        },
      });
  }

  irACheckout(): void {
    const funcion = this.funcion();
    const bloqueo = this.bloqueo();
    if (!funcion || !bloqueo || this.segundosRestantes() <= 0) {
      this.error.set('Tu reserva ha expirado. Selecciona nuevamente tus butacas.');
      return;
    }

    sessionStorage.setItem(
      'checkout_data',
      JSON.stringify({
        idFuncion: funcion.id,
        tituloPelicula: this.pelicula()?.titulo ?? 'Función',
        nombreSala: funcion.sala?.nombre ?? 'Sala',
        fechaHoraInicio: funcion.fechaHoraInicio,
        formato: `${funcion.formato} · ${funcion.idioma}`,
        butacaIds: this.seleccionadas().map((item) => item.butaca.id),
        codigosButacas: this.codigos(),
        subtotalButacas: this.subtotal(),
        expiraEn: bloqueo.expiraEn,
      }),
    );

    this.router.navigate(['/checkout']);
  }

  ngOnDestroy(): void {
    this.detenerTemporizador();
  }

  private iniciarTemporizador(): void {
    this.detenerTemporizador();
    this.tick.set(0);
    this.temporizador = setInterval(() => {
      this.tick.update((valor) => valor + 1);
      if (this.segundosRestantes() <= 0) {
        this.detenerTemporizador();
        this.bloqueo.set(null);
        this.error.set('El tiempo de reserva ha expirado. Selecciona nuevamente tus butacas.');
      }
    }, 1000);
  }

  private detenerTemporizador(): void {
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = undefined;
    }
  }
}