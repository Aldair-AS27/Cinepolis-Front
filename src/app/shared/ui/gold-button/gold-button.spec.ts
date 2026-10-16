import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoldButton } from './gold-button';

describe('GoldButton', () => {
  let component: GoldButton;
  let fixture: ComponentFixture<GoldButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoldButton],
    }).compileComponents();

    fixture = TestBed.createComponent(GoldButton);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emite presionado al hacer click', async () => {
    let eventos = 0;
    component.presionado.subscribe(() => eventos++);
    fixture.detectChanges();

    fixture.nativeElement.querySelector('button')?.click();
    expect(eventos).toBe(1);
  });

  it('no emite eventos cuando está deshabilitado', async () => {
    let eventos = 0;
    component.presionado.subscribe(() => eventos++);
    fixture.componentRef.setInput('disabled', true);
    await fixture.whenStable();

    const boton: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(boton.disabled).toBe(true);
    boton.click();
    expect(eventos).toBe(0);
  });
});
