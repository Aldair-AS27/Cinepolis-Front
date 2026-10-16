import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { DashboardPage } from './dashboard-page';
import { mockBackendInterceptor } from '../../../../core/interceptors/mock-backend-interceptor';

describe('DashboardPage', () => {
  let component: DashboardPage;
  let fixture: ComponentFixture<DashboardPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashboardPage],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([mockBackendInterceptor])),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DashboardPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('calcula estadísticas completas de todas las películas', async () => {
    await fixture.whenStable();

    const resumen = component.general();
    expect(component.cargando()).toBe(false);
    expect(component.error()).toBeNull();
    expect(resumen).toBeTruthy();

    // Películas y funciones
    expect(resumen!.totalPeliculas).toBe(6);
    expect(resumen!.enCartelera + resumen!.proximamente + resumen!.inactivas).toBe(6);
    expect(resumen!.totalFunciones).toBe(36);
    expect(resumen!.funcionesFuturas).toBeGreaterThan(0);
    expect(resumen!.totalSalas).toBe(5);
    expect(resumen!.salasEnUso).toBe(5);
    expect(resumen!.duracionPromedio).toBeGreaterThanOrEqual(resumen!.duracionMinima);
    expect(resumen!.duracionPromedio).toBeLessThanOrEqual(resumen!.duracionMaxima);

    // Butacas: 6 películas x 6 funciones x 80 butacas
    expect(resumen!.totalButacas).toBe(2880);
    expect(
      resumen!.butacasOcupadas + resumen!.butacasBloqueadas + resumen!.butacasDisponibles,
    ).toBe(2880);
    expect(resumen!.butacasOcupadas).toBeGreaterThan(0);
    expect(resumen!.ocupacionGlobal).toBeGreaterThan(0);
    expect(resumen!.ocupacionGlobal).toBeLessThan(100);
    expect(resumen!.ingresosEstimados).toBeGreaterThan(0);

    // Distribuciones consistentes
    expect(resumen!.peliculasPorGenero.reduce((total, c) => total + c.total, 0)).toBe(6);
    expect(resumen!.funcionesPorFormato.reduce((total, c) => total + c.total, 0)).toBe(36);
    expect(resumen!.funcionesPorIdioma.reduce((total, c) => total + c.total, 0)).toBe(36);
    expect(component.distribuciones().length).toBe(4);

    // Estadísticas por película
    const porPelicula = component.estadisticasPeliculas();
    expect(porPelicula.length).toBe(6);
    expect(porPelicula.every((fila) => fila.totalFunciones === 6)).toBe(true);
    expect(porPelicula.every((fila) => fila.ocupacion >= 0 && fila.ocupacion <= 100)).toBe(true);
    expect(porPelicula.every((fila) => fila.totalButacas === 480)).toBe(true);
    expect(porPelicula.reduce((total, fila) => total + fila.ingresosEstimados, 0)).toBeCloseTo(
      resumen!.ingresosEstimados,
      1,
    );

    // Estadísticas por sala (catálogo completo de la DB)
    const porSala = component.estadisticasSalas();
    expect(porSala.length).toBe(5);
    expect(porSala.reduce((total, sala) => total + sala.totalFunciones, 0)).toBe(36);
    expect(porSala.every((sala) => sala.totalButacas > 0)).toBe(true);

    // Tabla renderizada
    expect(fixture.nativeElement.querySelectorAll('tbody tr').length).toBe(6);
  });

  it('muestra la agenda general con películas, días y funciones', async () => {
    await fixture.whenStable();

    expect(component.agenda().length).toBe(6);
    expect(component.totalFunciones()).toBe(36);
    expect(component.agenda()[0].dias[0].etiqueta).toBe('Hoy');
    expect(fixture.nativeElement.querySelectorAll('article').length).toBe(6);
  });

  it('filtra la agenda por día (mañana)', async () => {
    await fixture.whenStable();
    component.filtroDia.set('MANANA');

    const grupos = component.agenda();
    expect(grupos.length).toBe(6);
    expect(grupos.every((g) => g.dias.length === 1 && g.dias[0].etiqueta === 'Mañana')).toBe(true);
    expect(component.totalFunciones()).toBe(12);
  });

  it('reservar() navega a /reserva/:funcionId', async () => {
    await fixture.whenStable();
    const router = TestBed.inject(Router);
    const navegar = vi.spyOn(router, 'navigate').mockResolvedValue(true);
    const funcion = component.agenda()[0].dias[0].funciones[0];

    component.reservar(funcion);

    expect(navegar).toHaveBeenCalledWith(['/reserva', funcion.id]);
  });
});
