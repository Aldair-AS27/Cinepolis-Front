import { CurrencyPipe } from './currency-pipe';

describe('CurrencyPipe', () => {
  const pipe = new CurrencyPipe();

  it('formatea soles con dos decimales', () => {
    expect(pipe.transform(35)).toBe('S/ 35.00');
  });

  it('formatea dólares sin espacio', () => {
    expect(pipe.transform(35, '$')).toBe('$35.00');
  });

  it('agrega separador de miles', () => {
    expect(pipe.transform(1234.5)).toBe('S/ 1,234.50');
  });

  it('devuelve cadena vacía para valores inválidos', () => {
    expect(pipe.transform(null)).toBe('');
    expect(pipe.transform(Number.NaN)).toBe('');
  });
});
