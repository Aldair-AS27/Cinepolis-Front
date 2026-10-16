import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Shell } from './shell';

describe('Shell', () => {
  let component: Shell;
  let fixture: ComponentFixture<Shell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Shell],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Shell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('compone navbar, main con router-outlet y footer', () => {
    const host: HTMLElement = fixture.nativeElement;
    expect(host.querySelector('app-navbar')).toBeTruthy();
    expect(host.querySelector('main router-outlet')).toBeTruthy();
    expect(host.querySelector('app-footer')).toBeTruthy();
  });
});
