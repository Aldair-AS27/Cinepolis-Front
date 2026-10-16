import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { CatalogPage } from './features/movies/pages/catalog-page/catalog-page';
import { MovieDetailPage } from './features/movies/pages/movie-detail-page/movie-detail-page';
import { SeatSelectionPage } from './features/booking/pages/seat-selection-page/seat-selection-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page/dashboard-page';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: CatalogPage, title: 'Cinépolis · Cartelera' },
      { path: 'dashboard', component: DashboardPage, title: 'Cinépolis · Horarios' },
      { path: 'pelicula/:id', component: MovieDetailPage, title: 'Cinépolis · Detalle' },
      { path: 'reserva/:funcionId', component: SeatSelectionPage, title: 'Cinépolis · Reserva' },
    ],
  },
  { path: '**', redirectTo: '' },
];
