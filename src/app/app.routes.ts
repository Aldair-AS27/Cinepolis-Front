import { Routes } from '@angular/router';
import { Shell } from './core/layout/shell/shell';
import { CatalogPage } from './features/movies/pages/catalog-page/catalog-page';
import { MovieDetailPage } from './features/movies/pages/movie-detail-page/movie-detail-page';
import { SeatSelectionPage } from './features/booking/pages/seat-selection-page/seat-selection-page';
import { DashboardPage } from './features/dashboard/pages/dashboard-page/dashboard-page';
import { LoginPage } from './features/auth/pages/login-page';
import { adminGuard } from './core/guards/admin.guard';
import { AdminLayout } from './features/admin/layout/admin-layout/admin-layout';
import { AdminPeliculasPage } from './features/admin/pages/admin-peliculas/admin-peliculas';

import { AdminSalasPage } from './features/admin/pages/admin-salas/admin-salas';
import { AdminHorariosPage } from './features/admin/pages/admin-horarios/admin-horarios';
import { RegisterPage } from './features/auth/pages/register-page';
import { CheckoutPage } from './features/booking/pages/checkout-page/checkout-page';

export const routes: Routes = [
  {
    path: '',
    component: Shell,
    children: [
      { path: '', component: CatalogPage, title: 'Cinépolis · Cartelera' },
      { path: 'login', component: LoginPage, title: 'Cinépolis · Acceso Admin' },
      { path: 'pelicula/:id', component: MovieDetailPage, title: 'Cinépolis · Detalle' },
      { path: 'reserva/:funcionId', component: SeatSelectionPage, title: 'Cinépolis · Reserva' },
      { path: 'registro', component: RegisterPage, title: 'Cinépolis · Registro' },
      { path: 'checkout', component: CheckoutPage, title: 'Cinépolis · Dulcería y Pago' },
    ],
  },
  {
    path: 'admin',
    component: AdminLayout,
    canActivate: [adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardPage, title: 'Admin · Dashboard' },
      { path: 'peliculas', component: AdminPeliculasPage, title: 'Admin · Películas' },
      { path: 'salas', component: AdminSalasPage, title: 'Admin · Salas' },
      { path: 'horarios', component: AdminHorariosPage, title: 'Admin · Horarios' },
    ],
  },
  { path: 'dashboard', redirectTo: 'admin/dashboard', pathMatch: 'full' },
  { path: '**', redirectTo: '' },
];