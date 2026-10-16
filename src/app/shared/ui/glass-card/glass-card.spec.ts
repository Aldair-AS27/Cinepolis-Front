import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GlassCard } from './glass-card';

describe('GlassCard', () => {
  let component: GlassCard;
  let fixture: ComponentFixture<GlassCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GlassCard],
    }).compileComponents();

    fixture = TestBed.createComponent(GlassCard);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('usa .glass-panel por defecto y .glass-panel-gold con variant="gold"', async () => {
    fixture.detectChanges();
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('.glass-panel')).toBeTruthy();

    fixture.componentRef.setInput('variant', 'gold');
    await fixture.whenStable();
    expect(host.querySelector('.glass-panel-gold')).toBeTruthy();
  });
});
