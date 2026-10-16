import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { SeatSelectionPage } from './seat-selection-page';
import { mockBackendInterceptor } from '../../../../core/interceptors/mock-backend-interceptor';

describe('SeatSelectionPage', () => {
  let component: SeatSelectionPage;
  let fixture: ComponentFixture<SeatSelectionPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatSelectionPage],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([mockBackendInterceptor])),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatSelectionPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('funcionId', '101');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga la función, su película y las 80 butacas', async () => {
    await fixture.whenStable();
    expect(component.funcion()?.id).toBe(101);
    expect(component.pelicula()?.id).toBe(1);
    expect(component.butacas().length).toBe(80);
    expect(fixture.nativeElement.querySelector('app-seat-grid')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('app-booking-summary')).toBeTruthy();
  });

  it('refleja la selección de butacas en el estado global', async () => {
    await fixture.whenStable();
    const disponible = component.butacas().find((item) => item.estado === 'DISPONIBLE');

    expect(disponible).toBeTruthy();
    component.toggleButaca(disponible!);

    expect(component.seleccionadas().length).toBe(1);
    expect(component.seleccionadas()[0].butaca.codigo).toBe(disponible!.butaca.codigo);
  });
});
