import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { FuncionService } from './funcion.service';
import {
  ApiResponse,
  BloqueoResponseDTO,
  FuncionButacaDTO,
  FuncionHorarioDTO,
} from '../../../core/models/cinema-domain.models';

const FUNCION_DTO: FuncionHorarioDTO = {
  idFuncion: 101,
  idPelicula: 1,
  tituloPelicula: 'El Último Horizonte',
  posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
  idSala: 4,
  nombreSala: 'Sala 04 Tradicional 3D',
  fechaHoraInicio: '2026-10-16T18:00:00.000Z',
  fechaHoraFin: '2026-10-16T20:28:00.000Z',
  formato: 'IMAX',
  version: 'DOB',
  precioBase: 38,
  estado: 'ACTIVA',
};

const BUTACAS_DTO: FuncionButacaDTO[] = [
  {
    idFuncionButaca: 5001,
    idButaca: 9001,
    fila: 'A',
    numero: 1,
    codigoButaca: 'A-01',
    tipoButaca: 'ESTANDAR',
    estadoDisponibilidad: 'OCUPADA',
  },
  {
    idFuncionButaca: 5002,
    idButaca: 9002,
    fila: 'G',
    numero: 2,
    codigoButaca: '',
    tipoButaca: 'VIP',
    estadoDisponibilidad: 'DISPONIBLE',
  },
  {
    idFuncionButaca: 5003,
    idButaca: 9003,
    fila: 'B',
    numero: 3,
    codigoButaca: 'B-03',
    tipoButaca: 'ESTANDAR',
    estadoDisponibilidad: 'BLOQUEADA',
    bloqueadoHasta: '2026-10-16T18:10:00.000Z',
    bloqueadaExpirada: false,
  },
  {
    idFuncionButaca: 5004,
    idButaca: 9004,
    fila: 'B',
    numero: 4,
    codigoButaca: 'B-04',
    tipoButaca: 'ESTANDAR',
    estadoDisponibilidad: 'BLOQUEADA',
    bloqueadaExpirada: true,
  },
];

function respuesta<T>(data: T, message = 'Operación exitosa'): ApiResponse<T> {
  return { success: true, message, data, timestamp: new Date().toISOString() };
}

describe('FuncionService (DTO -> dominio)', () => {
  let service: FuncionService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(FuncionService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('obtenerFuncionesPorPelicula() mapea horarios, sala e idioma', async () => {
    const promesa = firstValueFrom(service.obtenerFuncionesPorPelicula(1));
    const req = httpMock.expectOne('/api/funciones/pelicula/1');
    req.flush(respuesta<FuncionHorarioDTO[]>([FUNCION_DTO]));

    const funciones = await promesa;
    expect(funciones.length).toBe(1);
    expect(funciones[0].id).toBe(101);
    expect(funciones[0].peliculaId).toBe(1);
    expect(funciones[0].sala.tipoSala).toBe('IMAX');
    expect(funciones[0].sala.nombre).toContain('Sala');
    expect(funciones[0].idioma).toBe('DOBLADA');
    expect(funciones[0].formato).toBe('IMAX');
    expect(funciones[0].precioBase).toBe(38);
  });

  it('obtenerFuncion() devuelve el detalle mapeado', async () => {
    const promesa = firstValueFrom(service.obtenerFuncion(101));
    const req = httpMock.expectOne('/api/funciones/101');
    req.flush(respuesta<FuncionHorarioDTO>({ ...FUNCION_DTO, version: 'SUB' }));

    const funcion = await promesa;
    expect(funcion.id).toBe(101);
    expect(funcion.idioma).toBe('SUBTITULADA');
  });

  it('obtenerButacas() mapea estados, códigos, tipos y recargo VIP', async () => {
    const promesa = firstValueFrom(service.obtenerButacas(101, 38));
    const req = httpMock.expectOne('/api/funciones/101/butacas');
    req.flush(respuesta<FuncionButacaDTO[]>(BUTACAS_DTO));

    const butacas = await promesa;
    expect(butacas.length).toBe(4);

    const ocupada = butacas[0];
    expect(ocupada.id).toBe(5001);
    expect(ocupada.butaca.id).toBe(9001);
    expect(ocupada.butaca.codigo).toBe('A-01');
    expect(ocupada.estado).toBe('OCUPADA');
    expect(ocupada.precioFinal).toBe(38);

    const vip = butacas[1];
    expect(vip.butaca.codigo).toBe('G-2');
    expect(vip.butaca.tipo).toBe('VIP');
    expect(vip.precioFinal).toBe(50);

    expect(butacas[2].estado).toBe('BLOQUEADA');
    expect(butacas[3].estado).toBe('DISPONIBLE');
  });

  it('bloquearButacas() envía { idFuncion, butacaIds } y mapea BloqueoResponseDTO', async () => {
    const promesa = firstValueFrom(
      service.bloquearButacas({ funcionHorarioId: 101, butacaIds: [9001, 9002] }),
    );
    const req = httpMock.expectOne('/api/funciones/bloquear-butacas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ idFuncion: 101, butacaIds: [9001, 9002] });

    const dto: BloqueoResponseDTO = {
      bloqueadoExitoso: true,
      mensaje: 'Asientos bloqueados por 10 minutos',
      idFuncion: 101,
      butacasBloqueadas: [9001, 9002],
      expiraEn: new Date(Date.now() + 600_000).toISOString(),
      segundosRestantes: 600,
    };
    req.flush(respuesta<BloqueoResponseDTO>(dto));

    const bloqueo = await promesa;
    expect(bloqueo.funcionHorarioId).toBe(101);
    expect(bloqueo.butacasBloqueadas).toEqual([9001, 9002]);
    expect(new Date(bloqueo.expiraEn).getTime()).toBeGreaterThan(Date.now());
    expect(bloqueo.totalEstimado).toBe(0);
  });

  it('liberarButacas() hace POST con el arreglo de ids físicos', async () => {
    const promesa = firstValueFrom(service.liberarButacas(101, [9001, 9002]));
    const req = httpMock.expectOne('/api/funciones/101/liberar-butacas');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual([9001, 9002]);
    req.flush(respuesta<void>(undefined));

    await expect(promesa).resolves.toBeUndefined();
  });

  it('propaga el error del backend al bloquear butacas ocupadas', async () => {
    const promesa = firstValueFrom(
      service.bloquearButacas({ funcionHorarioId: 101, butacaIds: [9001] }),
    );
    const req = httpMock.expectOne('/api/funciones/bloquear-butacas');
    req.flush(
      { success: false, message: 'Butaca ocupada', data: null },
      { status: 409, statusText: 'Conflict' },
    );

    await expect(promesa).rejects.toMatchObject({ status: 409 });
  });
});
