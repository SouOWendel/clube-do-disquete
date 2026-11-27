import { Routes } from '@angular/router';
import { exigeLogin, exigeVisitante } from './core/sessao/guards';

/**
 * Cada feature cuida das proprias rotas e e carregada sob demanda.
 * O forum vem primeiro porque e dono da raiz (`/` = feed); as rotas de
 * autenticacao (`/entrar`, `/cadastro`...) so casam quando o forum nao casa.
 */
export const routes: Routes = [
  {
    path: '',
    canActivate: [exigeLogin],
    loadChildren: () => import('./features/forum/forum.routes').then((m) => m.FORUM_ROUTES),
  },
  {
    path: '',
    canActivate: [exigeVisitante],
    loadChildren: () => import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },
  { path: '**', redirectTo: '' },
];
