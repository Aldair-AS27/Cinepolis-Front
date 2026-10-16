import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieHero } from './movie-hero';
import { Pelicula } from '../../models/pelicula.model';

const PELICULA: Pelicula = {
  id: 1,
  titulo: 'El Último Horizonte',
  sinopsis: 'Una tripulación despierta a años luz de casa.',
  duracionMinutos: 148,
  clasificacion: 'B15',
  genero: 'Ciencia Ficción',
  posterUrl: 'https://imagen/poster.jpg',
  backdropUrl: 'https://imagen/backdrop.jpg',
  estado: 'CARTELERA',
  formatoDestacado: 'IMAX',
};

describe('MovieHero', () => {
  let component: MovieHero;
  let fixture: ComponentFixture<MovieHero>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieHero],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieHero);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('pelicula', PELICULA);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza título, formato, clasificación y duración formateada', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('h1')?.textContent).toContain('El Último Horizonte');
    expect(host.textContent).toContain('IMAX');
    expect(host.textContent).toContain('B15');
    expect(host.textContent).toContain('2h 28m');
  });
});
