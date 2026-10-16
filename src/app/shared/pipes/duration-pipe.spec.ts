import { DurationPipe } from './duration-pipe';

describe('DurationPipe', () => {
  const pipe = new DurationPipe();

  it('convierte 148 minutos en "2h 28m"', () => {
    expect(pipe.transform(148)).toBe('2h 28m');
  });

  it('muestra solo minutos cuando dura menos de una hora', () => {
    expect(pipe.transform(45)).toBe('45m');
  });

  it('omite los minutos cuando es exacto en horas', () => {
    expect(pipe.transform(120)).toBe('2h');
  });

  it('devuelve cadena vacía para valores inválidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(undefined)).toBe('');
    expect(pipe.transform(-10)).toBe('');
  });
});
