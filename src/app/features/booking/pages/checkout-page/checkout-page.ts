import { Component, OnDestroy, OnInit, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AuthService } from '../../../../core/services/auth.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-checkout-page',
  standalone: true,
  imports: [FormsModule, RouterLink, DatePipe, DecimalPipe],
  templateUrl: './checkout-page.html',
})
export class CheckoutPage implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  private tick = signal(0);
  private temporizador?: ReturnType<typeof setInterval>;
  private pagoTimeout?: ReturnType<typeof setTimeout>;

  readonly maxPorProducto = 5;

  datos = signal<any>(null);
  productos = signal<any[]>([]);
  cantidades = signal<Record<number, number>>({});

  metodoPago = signal<string>('TARJETA');
  procesando = signal(false);
  mensajeEstado = signal<string>('Pagar y Generar Boleto');
  error = signal<string | null>(null);
  reservaConfirmada = signal<any>(null);

  pagoTarjeta = {
    numero: '',
    titular: '',
    vencimiento: '',
    cvv: '',
  };

  pagoBilletera = {
    celular: '',
    nroOperacion: '',
  };

  segundosRestantes = computed(() => {
    this.tick();
    const expiraEn = this.datos()?.expiraEn;
    if (!expiraEn) return 0;
    return Math.max(0, Math.ceil((new Date(expiraEn).getTime() - Date.now()) / 1000));
  });

  tiempoExpirado = computed(() => !this.reservaConfirmada() && this.segundosRestantes() <= 0);

  temporizadorTexto = computed(() => {
    const total = this.segundosRestantes();
    const minutos = Math.floor(total / 60);
    const segundos = total % 60;
    return `${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  });

  subtotalDulceria = computed(() => {
    const mapa = this.cantidades();
    return this.productos().reduce((acc, p) => {
      const id = p.idProducto ?? p.id;
      const precio = Number(p.precioActual ?? p.precio ?? 0);
      return acc + precio * (mapa[id] || 0);
    }, 0);
  });

  totalFinal = computed(() => {
    const base = Number(this.datos()?.subtotalButacas ?? 0);
    return base + this.subtotalDulceria();
  });

  ngOnInit() {
    const raw = sessionStorage.getItem('checkout_data');
    if (!raw) {
      this.router.navigate(['/']);
      return;
    }
    this.datos.set(JSON.parse(raw));
    this.cargarDulceria();
    this.iniciarTemporizador();
  }

  ngOnDestroy() {
    this.detenerTemporizador();
    if (this.pagoTimeout) {
      clearTimeout(this.pagoTimeout);
    }
  }

  private iniciarTemporizador() {
    this.detenerTemporizador();
    this.temporizador = setInterval(() => {
      this.tick.update((v) => v + 1);
      if (this.segundosRestantes() <= 0) {
        this.detenerTemporizador();
        this.error.set('Tu tiempo ha expirado, por favor vuelve a intentarlo.');
        sessionStorage.removeItem('checkout_data');
      }
    }, 1000);
  }

  private detenerTemporizador() {
    if (this.temporizador) {
      clearInterval(this.temporizador);
      this.temporizador = undefined;
    }
  }

  cargarDulceria() {
    this.http.get<any>(`${this.apiUrl}/api/dulceria`).subscribe({
      next: (res) => {
        const lista = Array.isArray(res) ? res : (res?.data ?? []);
        this.productos.set(lista);
      },
    });
  }

  cambiarCantidad(idProducto: number, delta: number) {
    if (this.tiempoExpirado() || this.procesando()) return;
    this.cantidades.update((actual) => {
      const actualCant = actual[idProducto] || 0;
      const nueva = Math.min(this.maxPorProducto, Math.max(0, actualCant + delta));
      return { ...actual, [idProducto]: nueva };
    });
  }

  seleccionarMetodo(metodo: string) {
    this.metodoPago.set(metodo);
    this.error.set(null);
  }

  formatearTarjeta(event: Event) {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 16);
    const formateado = soloNumeros.replace(/(\d{4})(?=\d)/g, '$1 ');
    this.pagoTarjeta.numero = formateado;
    input.value = formateado;
  }

  formatearVencimiento(event: Event) {
    const input = event.target as HTMLInputElement;
    const soloNumeros = input.value.replace(/\D/g, '').slice(0, 4);
    const formateado =
      soloNumeros.length >= 3
        ? `${soloNumeros.slice(0, 2)}/${soloNumeros.slice(2)}`
        : soloNumeros;
    this.pagoTarjeta.vencimiento = formateado;
    input.value = formateado;
  }

  private validarLuhn(numero: string): boolean {
    let suma = 0;
    let alternar = false;
    for (let i = numero.length - 1; i >= 0; i--) {
      let digito = parseInt(numero.charAt(i), 10);
      if (alternar) {
        digito *= 2;
        if (digito > 9) digito -= 9;
      }
      suma += digito;
      alternar = !alternar;
    }
    return suma % 10 === 0;
  }

  private validarFechaVigente(mmAa: string): boolean {
    const [mesStr, anioStr] = mmAa.split('/');
    const mes = parseInt(mesStr, 10);
    const anio = 2000 + parseInt(anioStr, 10);

    const hoy = new Date();
    const mesActual = hoy.getMonth() + 1;
    const anioActual = hoy.getFullYear();

    if (anio < anioActual) return false;
    if (anio === anioActual && mes < mesActual) return false;
    return true;
  }

  private validarDatosPago(): string | null {
    if (this.metodoPago() === 'TARJETA') {
      const numLimpio = this.pagoTarjeta.numero.replace(/\s+/g, '');
      if (!/^\d{16}$/.test(numLimpio)) {
        return 'Ingresa un número de tarjeta válido de 16 dígitos.';
      }
      if (!this.validarLuhn(numLimpio)) {
        return 'El número de tarjeta no es válido (verifica los dígitos).';
      }
      if (this.pagoTarjeta.titular.trim().length < 3) {
        return 'Ingresa el nombre del titular de la tarjeta.';
      }
      const fecha = this.pagoTarjeta.vencimiento.trim();
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(fecha)) {
        return 'Ingresa la fecha de vencimiento en formato MM/AA (ej. 08/29).';
      }
      if (!this.validarFechaVigente(fecha)) {
        return 'La tarjeta ingresada se encuentra vencida.';
      }
      if (!/^\d{3,4}$/.test(this.pagoTarjeta.cvv.trim())) {
        return 'Ingresa un código CVV válido de 3 o 4 dígitos.';
      }
    } else {
      const celLimpio = this.pagoBilletera.celular.replace(/\s+/g, '');
      if (!/^9\d{8}$/.test(celLimpio)) {
        return `Ingresa un número de celular válido de 9 dígitos para ${this.metodoPago()}.`;
      }
      if (!/^\d{8}$/.test(this.pagoBilletera.nroOperacion.trim())) {
        return `Ingresa el Nro. de operación de 8 dígitos de tu comprobante ${this.metodoPago()}.`;
      }
    }
    return null;
  }

  confirmarPago() {
    if (this.tiempoExpirado()) {
      this.error.set('Tu tiempo ha expirado, por favor vuelve a intentarlo.');
      return;
    }

    const info = this.datos();
    if (!info || this.procesando()) return;

    const errorValidacion = this.validarDatosPago();
    if (errorValidacion) {
      this.error.set(errorValidacion);
      return;
    }

    this.procesando.set(true);
    this.error.set(null);
    this.mensajeEstado.set(
      this.metodoPago() === 'TARJETA'
        ? 'Verificando pago con el banco...'
        : `Validando operación en ${this.metodoPago()}...`,
    );

    const mapa = this.cantidades();
    const itemsDulceria = Object.entries(mapa)
      .filter(([, cant]) => cant > 0)
      .map(([id, cantidad]) => ({
        idProducto: Number(id),
        cantidad,
      }));

    const payload = {
      idFuncion: info.idFuncion,
      butacaIds: info.butacaIds,
      clienteNombre: this.authService.userName() || 'Cliente Cinépolis',
      clienteEmail: this.authService.getCorreo() || 'cliente@cinepolis.com',
      metodoPago: this.metodoPago(),
      itemsDulceria,
    };

    this.pagoTimeout = setTimeout(() => {
      if (this.tiempoExpirado()) {
        this.procesando.set(false);
        this.error.set('Tu tiempo expiró durante la validación. Vuelve a intentarlo.');
        return;
      }

      this.mensajeEstado.set('Emitiendo tu boleto QR...');

      this.http.post<any>(`${this.apiUrl}/api/reservas`, payload).subscribe({
        next: (res) => {
          this.detenerTemporizador();
          this.procesando.set(false);
          this.reservaConfirmada.set(res?.data ?? res);
          sessionStorage.removeItem('checkout_data');
        },
        error: (err) => {
          this.procesando.set(false);
          this.error.set(
            err?.error?.message || 'No se pudo procesar el pago. Verifica que tus asientos no hayan expirado.',
          );
        },
      });
    }, 1500);
  }

  qrUrl(reserva: any): string {
    const texto = reserva?.tokenQrAcceso || reserva?.codigoReserva || 'CINEPOLIS-TICKET';
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(texto)}`;
  }

  descargarBoleta() {
    window.print();
  }
}