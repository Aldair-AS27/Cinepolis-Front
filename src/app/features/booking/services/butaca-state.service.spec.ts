import { TestBed } from '@angular/core/testing';
import { ButacaStateService } from './butaca-state.service';
import { FuncionButaca, FuncionHorario } from '../../../core/models/cinema-domain.models';

function crearButaca(
  id: number,
  codigo: string,
  estado: FuncionButaca['estado'],
  precioFinal = 35,
): FuncionButaca {
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
    estado,
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
  fechaHoraInicio: new Date().toISOString(),
  fechaHoraFin: new Date().toISOString(),
  idioma: 'SUBTITULADA',
  formato: 'IMAX',
  precioBase: 42,
};

describe('ButacaStateService', () => {
  let service: ButacaStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ButacaStateService);
  });

  it('ignora butacas OCUPADAS o BLOQUEADAS', () => {
    service.iniciar(FUNCION);

    service.toggleButaca(crearButaca(1, 'A-01', 'OCUPADA'));
    service.toggleButaca(crearButaca(2, 'A-02', 'BLOQUEADA'));

    expect(service.totalBoletos()).toBe(0);
    expect(service.seleccionadas()).toEqual([]);
  });

  it('agrega y quita butacas disponibles (toggle)', () => {
    service.iniciar(FUNCION);
    const butaca = crearButaca(3, 'B-03', 'DISPONIBLE');

    service.toggleButaca(butaca);
    expect(service.totalBoletos()).toBe(1);
    expect(service.estaSeleccionada(3)).toBe(true);

    service.toggleButaca(butaca);
    expect(service.totalBoletos()).toBe(0);
    expect(service.estaSeleccionada(3)).toBe(false);
  });

  it('respeta el límite máximo de 8 butacas', () => {
    service.iniciar(FUNCION);
    for (let i = 1; i <= 12; i++) {
      service.toggleButaca(crearButaca(i, `C-${String(i).padStart(2, '0')}`, 'DISPONIBLE'));
    }

    expect(service.maxBoletos).toBe(8);
    expect(service.totalBoletos()).toBe(8);
    expect(service.puedeAgregarMas()).toBe(false);
  });

  it('calcula subtotal y códigos seleccionados con exactitud', () => {
    service.iniciar(FUNCION);
    service.toggleButaca(crearButaca(1, 'F-07', 'DISPONIBLE', 42));
    service.toggleButaca(crearButaca(2, 'F-08', 'DISPONIBLE', 54));

    expect(service.subtotal()).toBe(96);
    expect(service.codigosSeleccionados()).toEqual(['F-07', 'F-08']);
  });

  it('iniciar() resetea la selección y limpiarSeleccion() la vacía', () => {
    service.iniciar(FUNCION, [crearButaca(1, 'D-01', 'DISPONIBLE')]);
    expect(service.mapaButacas().length).toBe(1);
    service.toggleButaca(crearButaca(1, 'D-01', 'DISPONIBLE'));
    expect(service.totalBoletos()).toBe(1);

    service.limpiarSeleccion();
    expect(service.totalBoletos()).toBe(0);
    expect(service.subtotal()).toBe(0);
  });
});
