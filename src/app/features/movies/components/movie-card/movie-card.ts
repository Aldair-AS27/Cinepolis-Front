import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Pelicula } from '../../models/pelicula.model';
import { BadgeSala } from '../../../../shared/ui/badge-sala/badge-sala';
import { GoldButton } from '../../../../shared/ui/gold-button/gold-button';
import { DurationPipe } from '../../../../shared/pipes/duration-pipe';

@Component({
  selector: 'app-movie-card',
  imports: [BadgeSala, GoldButton, DurationPipe],
  templateUrl: './movie-card.html',
  styleUrl: './movie-card.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MovieCard {
  readonly pelicula = input.required<Pelicula>();
  readonly verFunciones = output<Pelicula>();
}
