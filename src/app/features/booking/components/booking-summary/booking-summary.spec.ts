import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { BookingSummary } from './booking-summary';
import { FuncionButaca } from '../../models/funcion-butaca.model';
import { FuncionHorario } from '../../models/funcion-horario.model';
import { mockBackendInterceptor } from '../../../../core/interceptors/mock-backend-interceptor';

function crearItem(id: number, codigo: string, precioFinal: number): FuncionButaca {
  const [fila, numero] = codigo.split('-');
  return {
    id,
    funcionHorarioId: 101,
    butaca: {
      id,
      salaId: 1,
      fila,
      numero: Number(numero),
      codigo,
      tipo: 'ESTANDAR',
    },
    estado: 'DISPONIBLE',
    precioFinal,
  };
}

const FUNCION: FuncionHorario = {
  id: 101,
  peliculaId: 1,
  sala: {
    id: 1,
    nombre: 'Sala 01 IMAX Laser',
    capacidadTotal: 80,
    tipoSala: 'IMAX',
    filas: 8,
    columnas: 10,
  },
  fechaHoraInicio: '2026-10-16T18:00:00.000Z',
  fechaHoraFin: '2026-10-16T20:28:00.000Z',
  idioma: 'SUBTITULADA',
  formato: 'IMAX',
  precioBase: 42,
};

describe('BookingSummary', () => {
  let component: BookingSummary;
  let fixture: ComponentFixture<BookingSummary>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingSummary],
      providers: [provideHttpClient(withInterceptors([mockBackendInterceptor]))],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingSummary);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('funcion', FUNCION);
    fixture.componentRef.setInput('seleccionadas', [
      crearItem(1, 'F-07', 42),
      crearItem(2, 'F-08', 54),
    ]);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calcula totalBoletos, subtotal y chips de códigos', () => {
    expect(component.totalBoletos()).toBe(2);
    expect(component.subtotal()).toBe(96);
    expect(component.codigos()).toEqual(['F-07', 'F-08']);
    expect(fixture.nativeElement.textContent).toContain('2 / 8 boletos');
  });

  it('bloquea los asientos y muestra el temporizador', async () => {
    expect(component.bloqueo()).toBeNull();

    component.confirmarBloqueo();
    await fixture.whenStable();

    expect(component.bloqueo()).toBeTruthy();
    expect(component.segundosRestantes()).toBeGreaterThan(0);
    expect(component.temporizadorTexto()).toMatch(/\d{2}:\d{2}/);
  });
});
