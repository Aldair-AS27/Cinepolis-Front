import { Component, OnInit, inject, signal, computed } from '@angular/core';
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
export class CheckoutPage implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);
  private apiUrl = environment.apiUrl;

  datos = signal<any>(null);
  productos = signal<any[]>([]);
  cantidades = signal<Record<number, number>>({});

  metodoPago = signal<string>('TARJETA');
  procesando = signal(false);
  error = signal<string | null>(null);
  reservaConfirmada = signal<any>(null);

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
    this.cantidades.update((actual) => {
      const nueva = Math.max(0, (actual[idProducto] || 0) + delta);
      return { ...actual, [idProducto]: nueva };
    });
  }

  confirmarPago() {
    const info = this.datos();
    if (!info || this.procesando()) return;

    this.procesando.set(true);
    this.error.set(null);

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

    this.http.post<any>(`${this.apiUrl}/api/reservas`, payload).subscribe({
      next: (res) => {
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
  }

  qrUrl(reserva: any): string {
    const texto = reserva?.tokenQrAcceso || reserva?.codigoReserva || 'CINEPOLIS-TICKET';
    return `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(texto)}`;
  }
}