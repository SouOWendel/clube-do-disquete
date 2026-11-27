import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api/api-url';
import { Sessao } from './sessao';

/**
 * Envia o token JWT para a API. Se ele expirar (401), encerra a sessao local
 * e volta para o login.
 */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessao = inject(Sessao);
  const router = inject(Router);
  const token = sessao.token();
  const paraApi = req.url.startsWith(inject(API_URL));

  const requisicao =
    token && paraApi
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (
        token &&
        paraApi &&
        erro instanceof HttpErrorResponse &&
        erro.status === 401
      ) {
        sessao.encerrar();
        router.navigateByUrl('/entrar');
      }
      return throwError(() => erro);
    }),
  );
};
