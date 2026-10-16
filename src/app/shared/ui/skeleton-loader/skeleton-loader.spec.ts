import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkeletonLoader } from './skeleton-loader';

describe('SkeletonLoader', () => {
  let component: SkeletonLoader;
  let fixture: ComponentFixture<SkeletonLoader>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkeletonLoader],
    }).compileComponents();

    fixture = TestBed.createComponent(SkeletonLoader);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza la cantidad de líneas indicadas con animate-pulse', async () => {
    fixture.componentRef.setInput('filas', 4);
    await fixture.whenStable();

    const lineas = fixture.nativeElement.querySelectorAll('.animate-pulse');
    expect(lineas.length).toBe(4);
  });
});
