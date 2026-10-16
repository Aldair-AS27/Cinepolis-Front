import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieCard } from './movie-card';
import { Pelicula } from '../../models/pelicula.model';

const PELICULA: Pelicula = {
  id: 2,
  titulo: 'Ciudad de Neón',
  sinopsis: 'Un detective con amnesia persigue a su única testigo.',
  duracionMinutos: 122,
  clasificacion: 'B14',
  genero: 'Thriller',
  posterUrl: 'https://imagen/poster.jpg',
  backdropUrl: 'https://imagen/backdrop.jpg',
  estado: 'CARTELERA',
  formatoDestacado: '4DX',
};

describe('MovieCard', () => {
  let component: MovieCard;
  let fixture: ComponentFixture<MovieCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieCard],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieCard);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pelicula', PELICULA);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('muestra póster, clasificación, formato y duración', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('img')?.getAttribute('src')).toBe('https://imagen/poster.jpg');
    expect(host.textContent).toContain('B14');
    expect(host.textContent).toContain('4DX');
    expect(host.textContent).toContain('2h 2m');
  });

  it('emite verFunciones al presionar el botón', () => {
    const emitidos: Pelicula[] = [];
    component.verFunciones.subscribe((pelicula) => emitidos.push(pelicula));

    fixture.nativeElement.querySelector('button')?.click();

    expect(emitidos.length).toBe(1);
    expect(emitidos[0].id).toBe(2);
  });
});
