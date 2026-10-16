import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { firstValueFrom } from 'rxjs';
import { PeliculaService } from './pelicula.service';
import { ApiResponse, PeliculaDTO } from '../../../core/models/cinema-domain.models';

const PELICULA_DTO: PeliculaDTO = {
  idPelicula: 1,
  titulo: 'El Último Horizonte',
  sinopsis: 'Sinopsis de prueba',
  duracionMinutos: 148,
  clasificacion: 'B15',
  genero: 'Ciencia Ficción',
  posterUrl: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa',
  estado: 'CARTELERA',
};

function respuesta<T>(data: T, message = 'Operación exitosa'): ApiResponse<T> {
  return { success: true, message, data, timestamp: new Date().toISOString() };
}

describe('PeliculaService (DTO -> dominio)', () => {
  let service: PeliculaService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(PeliculaService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpMock.verify());

  it('listarPeliculas() mapea PeliculaDTO[] al dominio', async () => {
    const promesa = firstValueFrom(service.listarPeliculas());
    const req = httpMock.expectOne('/api/peliculas');
    expect(req.request.method).toBe('GET');
    req.flush(respuesta<PeliculaDTO[]>([PELICULA_DTO]));

    const peliculas = await promesa;
    expect(peliculas.length).toBe(1);
    expect(peliculas[0].id).toBe(1);
    expect(peliculas[0].titulo).toBe('El Último Horizonte');
    expect(peliculas[0].estado).toBe('CARTELERA');
    expect(peliculas[0].backdropUrl).toBe(PELICULA_DTO.posterUrl);
    expect(peliculas[0].formatoDestacado).toBe('IMAX');
  });

  it('listarPeliculas(true) envía ?todas=true', async () => {
    const promesa = firstValueFrom(service.listarPeliculas(true));
    const req = httpMock.expectOne(
      (r) => r.url === '/api/peliculas' && r.params.get('todas') === 'true',
    );
    req.flush(respuesta<PeliculaDTO[]>([PELICULA_DTO]));

    expect((await promesa).length).toBe(1);
  });

  it('obtenerPelicula() normaliza estado INACTIVO y aplica poster fallback', async () => {
    const promesa = firstValueFrom(service.obtenerPelicula(2));
    const req = httpMock.expectOne('/api/peliculas/2');
    req.flush(
      respuesta<PeliculaDTO>({ ...PELICULA_DTO, idPelicula: 2, posterUrl: '', estado: 'INACTIVO' }),
    );

    const pelicula = await promesa;
    expect(pelicula.id).toBe(2);
    expect(pelicula.estado).toBe('INACTIVA');
    expect(pelicula.backdropUrl).toContain('https://images.unsplash.com');
  });

  it('buscarPeliculas() llama /peliculas/buscar?q=...', async () => {
    const promesa = firstValueFrom(service.buscarPeliculas('neón'));
    const req = httpMock.expectOne(
      (r) => r.url === '/api/peliculas/buscar' && r.params.get('q') === 'neón',
    );
    req.flush(respuesta<PeliculaDTO[]>([PELICULA_DTO]));

    expect((await promesa).length).toBe(1);
  });

  it('filtrarPorGenero() llama /peliculas/genero/{genero}', async () => {
    const promesa = firstValueFrom(service.filtrarPorGenero('Terror'));
    const req = httpMock.expectOne('/api/peliculas/genero/Terror');
    req.flush(respuesta<PeliculaDTO[]>([]));

    expect(await promesa).toEqual([]);
  });

  it('propaga un HttpErrorResponse 404 si la película no existe', async () => {
    const promesa = firstValueFrom(service.obtenerPelicula(999));
    const req = httpMock.expectOne('/api/peliculas/999');
    req.flush(
      { success: false, message: 'Película no encontrada', data: null },
      { status: 404, statusText: 'Not Found' },
    );

    await expect(promesa).rejects.toMatchObject({ status: 404 });
  });
});
