import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Sessao } from './sessao';

/** O forum inteiro exige login (a API responde 401 sem token). */
export const exigeLogin: CanActivateFn = () =>
  inject(Sessao).logado() || inject(Router).createUrlTree(['/entrar']);

/** Login, cadastro e recuperacao de senha sao so para quem nao esta logado. */
export const exigeVisitante: CanActivateFn = () =>
  !inject(Sessao).logado() || inject(Router).createUrlTree(['/']);
