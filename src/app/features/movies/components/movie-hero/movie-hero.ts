import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pelicula } from '../../models/pelicula.model';
import { BadgeSala } from '../../../../shared/ui/badge-sala/badge-sala';
import { GoldButton } from '../../../../shared/ui/gold-button/gold-button';
import { DurationPipe } from '../../../../shared/pipes/duration-pipe';

@Component({
  selector: 'app-movie-hero',
  imports: [BadgeSala, GoldButton, DurationPipe],
  templateUrl: './movie-hero.html',
  styleUrl: './movie-hero.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieHero {
  readonly pelicula = input.required<Pelicula>();
  readonly verDetalle = output<Pelicula>();
}
