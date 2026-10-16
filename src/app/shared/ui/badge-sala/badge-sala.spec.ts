import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BadgeSala } from './badge-sala';

describe('BadgeSala', () => {
  let component: BadgeSala;
  let fixture: ComponentFixture<BadgeSala>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BadgeSala],
    }).compileComponents();

    fixture = TestBed.createComponent(BadgeSala);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('texto', 'IMAX');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renderiza el texto del formato con borde dorado', () => {
    const span: HTMLElement = fixture.nativeElement.querySelector('span');
    expect(span.textContent).toContain('IMAX');
    expect(span.className).toContain('border-gold/50');
  });
});
