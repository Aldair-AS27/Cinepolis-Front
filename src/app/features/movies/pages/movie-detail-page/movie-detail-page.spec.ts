import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { MovieDetailPage } from './movie-detail-page';
import { mockBackendInterceptor } from '../../../../core/interceptors/mock-backend-interceptor';

describe('MovieDetailPage', () => {
  let component: MovieDetailPage;
  let fixture: ComponentFixture<MovieDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MovieDetailPage],
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([mockBackendInterceptor])),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MovieDetailPage);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('id', '1');
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('carga detalle y horarios desde el backend simulado', async () => {
    await fixture.whenStable();
    expect(component.pelicula()?.id).toBe(1);
    expect(component.funciones().length).toBe(6);
    expect(fixture.nativeElement.querySelector('app-showtime-selector')).toBeTruthy();
  });
});
