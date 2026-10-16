import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-glass-card',
  imports: [],
  templateUrl: './glass-card.html',
  styleUrl: './glass-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GlassCard {
  /** Variante visual del panel de cristal. */
  readonly variant = input<'default' | 'gold'>('default');
}
