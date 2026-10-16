import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-skeleton-loader',
  imports: [],
  templateUrl: './skeleton-loader.html',
  styleUrl: './skeleton-loader.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SkeletonLoader {
  /** Cantidad de líneas fantasma a mostrar. */
  readonly filas = input(3);

  readonly indices = computed(() => Array.from({ length: this.filas() }, (_, indice) => indice));
}
