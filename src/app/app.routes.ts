import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { CatalogPage } from './features/movies/pages/catalog-page/catalog-page';
import { MovieDetailPage } from './features/movies/pages/movie-detail-page/movie-detail-page';
import { SeatSelectionPage } from './features/booking/pages/seat-selection-page/seat-selection-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page/dashboard-page';
// login
import { LoginPage } from './features/auth/pages/login-page';
import { adminGuard } from './core/guards/admin.guard';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: CatalogPage, title: 'Cinépolis · Cartelera' },

      // login 
      { path: 'login', component: LoginPage, title: 'Cinépolis · Iniciar sesión' },
      
      { 
        path: 'dashboard',
         component: DashboardPage,
         canActivate: [adminGuard],
         title: 'Cinépolis · Horarios' 
        },

      { path: 'pelicula/:id', component: MovieDetailPage, title: 'Cinépolis · Detalle' },
      { path: 'reserva/:funcionId', component: SeatSelectionPage, title: 'Cinépolis · Reserva' },
    ],
  },
  { path: '**', redirectTo: '' },
];
