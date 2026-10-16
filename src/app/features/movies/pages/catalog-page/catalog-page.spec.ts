import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { CatalogPage } from './catalog-page';
import { mockBackendInterceptor } from '../../../../core/interceptors/mock-backend-interceptor';

describe('CatalogPage', () => {
  let component: CatalogPage;
  let fixture: ComponentFixture<CatalogPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CatalogPage],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([mockBackendInterceptor])),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CatalogPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga la cartelera y muestra el hero destacado', async () => {
    await fixture.whenStable();
    expect(component.peliculas().length).toBe(6);
    expect(component.destacada()).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-movie-hero')).toBeTruthy();
  });

  it('filtra por búsqueda de texto', async () => {
    await fixture.whenStable();
    component.aplicarFiltros({ busqueda: 'neón', formato: 'TODOS', estado: 'TODOS' });
    expect(component.filtradas().length).toBe(1);
    expect(component.filtradas()[0].titulo).toContain('Neón');
  });
});
