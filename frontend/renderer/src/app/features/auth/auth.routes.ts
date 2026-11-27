import { Routes } from '@angular/router';

export const AUTH_ROUTES: Routes = [
  {
    path: 'entrar',
    title: 'Entrar · Clube do Disquete',
    loadComponent: () => import('./pages/login/login').then((m) => m.Login),
  },
  {
    path: 'cadastro',
    title: 'Criar conta · Clube do Disquete',
    loadComponent: () =>
      import('./pages/cadastro/cadastro').then((m) => m.Cadastro),
  },
  {
    path: 'esqueci-senha',
    title: 'Recuperar a senha · Clube do Disquete',
    loadComponent: () =>
      import('./pages/esqueci-senha/esqueci-senha').then((m) => m.EsqueciSenha),
  },
];
