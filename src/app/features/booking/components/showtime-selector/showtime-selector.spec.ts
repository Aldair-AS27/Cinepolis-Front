import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ShowtimeSelector } from './showtime-selector';
import { FuncionHorario } from '../../models/funcion-horario.model';

const SALA_IMAX: FuncionHorario['sala'] = {
  id: 1,
  nombre: 'Sala 01 IMAX Laser',
  capacidadTotal: 80,
  tipoSala: 'IMAX',
  filas: 8,
  columnas: 10,
};

const FUNCIONES: FuncionHorario[] = [
  {
    id: 101,
    peliculaId: 1,
    sala: SALA_IMAX,
    fechaHoraInicio: '2026-10-16T18:00:00.000Z',
    fechaHoraFin: '2026-10-16T20:28:00.000Z',
    idioma: 'SUBTITULADA',
    formato: 'IMAX',
    precioBase: 42,
  },
  {
    id: 102,
    peliculaId: 1,
    sala: { ...SALA_IMAX, id: 2, nombre: 'Sala 02 VIP Lounge', tipoSala: 'VIP' },
    fechaHoraInicio: '2026-10-16T21:00:00.000Z',
    fechaHoraFin: '2026-10-16T23:28:00.000Z',
    idioma: 'DOBLADA',
    formato: 'VIP',
    precioBase: 38,
  },
];

describe('ShowtimeSelector', () => {
  let component: ShowtimeSelector;
  let fixture: ComponentFixture<ShowtimeSelector>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowtimeSelector],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowtimeSelector);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('funciones', FUNCIONES);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agrupa las funciones por sala', () => {
    expect(component.grupos().length).toBe(2);
    expect(component.grupos()[0].funciones.length).toBe(1);
  });

  it('emite la función seleccionada y marca la tarjeta', () => {
    const emitidas: FuncionHorario[] = [];
    component.seleccion.subscribe((funcion) => emitidas.push(funcion));

    component.seleccionar(FUNCIONES[1]);

    expect(emitidas.length).toBe(1);
    expect(emitidas[0].id).toBe(102);
    expect(component.seleccionada()).toBe(102);
  });
});
