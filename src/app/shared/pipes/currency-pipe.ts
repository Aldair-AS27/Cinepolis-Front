import { Pipe, PipeTransform } from '@angular/core';

const FORMATO_NUMERICO = new Intl.NumberFormat('en-US', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Formatea montos a moneda elegante: S/ 35.00 · $35.00 */
@Pipe({
  name: 'currency',
})
export class CurrencyPipe implements PipeTransform {
  transform(valor: number | null | undefined, simbolo: 'S/' | '$' = 'S/'): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
      return '';
    }

    const separador = simbolo === '$' ? '' : ' ';
    return `${simbolo}${separador}${FORMATO_NUMERICO.format(valor)}`;
  }
}
