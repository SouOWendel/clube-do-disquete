import { Routes } from '@angular/router';

/** Cada feature cuida das proprias rotas e e carregada sob demanda. */
export const routes: Routes = [
  // Enquanto o feed do forum nao existe, a raiz leva para o login.
  { path: '', pathMatch: 'full', redirectTo: 'entrar' },
  {
    path: '',
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
