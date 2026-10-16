import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

@Component({
  selector: 'app-gold-button',
  imports: [],
  templateUrl: './gold-button.html',
  styleUrl: './gold-button.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GoldButton {
  readonly disabled = input(false);
  readonly tipo = input<'button' | 'submit'>('button');
  readonly anchoCompleto = input(false);
  readonly presionado = output<MouseEvent>();
}
