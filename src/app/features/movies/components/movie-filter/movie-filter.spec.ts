import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MovieFilter } from './movie-filter';
import { FiltroPeliculas } from '../../models/pelicula.model';

describe('MovieFilter', () => {
  let component: MovieFilter;
  let fixture: ComponentFixture<MovieFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieFilter],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emite filtros combinados al buscar y cambiar formato', () => {
    const emitidos: FiltroPeliculas[] = [];
    component.filtros.subscribe((filtro) => emitidos.push(filtro));

    component.actualizarBusqueda('dune');
    component.cambiarFormato('IMAX');

    expect(emitidos[0]).toEqual({ busqueda: 'dune', formato: 'TODOS', estado: 'CARTELERA' });
    expect(emitidos[1]).toEqual({ busqueda: 'dune', formato: 'IMAX', estado: 'CARTELERA' });
  });

  it('renderiza los chips de formato', () => {
    expect(fixture.nativeElement.textContent).toContain('4DX');
  });
});
