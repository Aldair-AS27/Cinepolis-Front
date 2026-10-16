import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-badge-sala',
  imports: [],
  templateUrl: './badge-sala.html',
  styleUrl: './badge-sala.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BadgeSala {
  /** Texto del badge: IMAX, VIP, 4DX, 2D, etc. */
  readonly texto = input.required<string>();
}
