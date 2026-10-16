import { Pipe, PipeTransform } from '@angular/core';

/** Convierte una duración en minutos a formato humano: 148 -> "2h 28m". */
@Pipe({
  name: 'duration',
})
export class DurationPipe implements PipeTransform {
  transform(minutos: number | null | undefined): string {
    if (minutos === null || minutos === undefined || Number.isNaN(minutos) || minutos < 0) {
      return '';
    }

    const horas = Math.floor(minutos / 60);
    const resto = minutos % 60;

    if (horas === 0) return `${resto}m`;
    if (resto === 0) return `${horas}h`;
    return `${horas}h ${resto}m`;
  }
}
