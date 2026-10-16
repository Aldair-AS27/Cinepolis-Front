import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SeatGrid } from './seat-grid';
import { FuncionButaca } from '../../models/funcion-butaca.model';

function crearButaca(id: number, fila: string, numero: number, estado: FuncionButaca['estado']): FuncionButaca {
  return {
    id,
    funcionHorarioId: 101,
    butaca: {
      id,
      salaId: 1,
      fila,
      numero,
      codigo: `${fila}-${String(numero).padStart(2, '0')}`,
      tipo: fila === 'G' ? 'VIP' : 'ESTANDAR',
    },
    estado,
    precioFinal: 42,
  };
}

const BUTACAS: FuncionButaca[] = [
  crearButaca(1, 'A', 1, 'DISPONIBLE'),
  crearButaca(2, 'A', 2, 'OCUPADA'),
  crearButaca(3, 'B', 1, 'BLOQUEADA'),
  crearButaca(4, 'G', 1, 'DISPONIBLE'),
];

describe('SeatGrid', () => {
  let component: SeatGrid;
  let fixture: ComponentFixture<SeatGrid>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SeatGrid],
    }).compileComponents();

    fixture = TestBed.createComponent(SeatGrid);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('butacas', BUTACAS);
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('agrupa las butacas por fila', () => {
    expect(component.filas().map((f) => f.fila)).toEqual(['A', 'B', 'G']);
  });

  it('marca ocupadas y bloqueadas como no seleccionables', () => {
    const botones: HTMLButtonElement[] = [...fixture.nativeElement.querySelectorAll('button')];
    const ocupada = botones.find((b) => b.getAttribute('aria-label')?.includes('A-02'));
    const bloqueada = botones.find((b) => b.getAttribute('aria-label')?.includes('B-01'));

    expect(ocupada?.disabled).toBe(true);
    expect(bloqueada?.disabled).toBe(true);
  });

  it('emite butacaToggle solo para butacas disponibles', () => {
    const emitidas: FuncionButaca[] = [];
    component.butacaToggle.subscribe((item) => emitidas.push(item));

    component.toggle(BUTACAS[0]);
    component.toggle(BUTACAS[1]);
    component.toggle(BUTACAS[2]);

    expect(emitidas.length).toBe(1);
    expect(emitidas[0].id).toBe(1);
  });
});
