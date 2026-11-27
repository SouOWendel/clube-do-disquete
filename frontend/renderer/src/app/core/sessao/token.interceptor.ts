import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { API_URL } from '../api/api-url';
import { Sessao } from './sessao';

/** Envia o token JWT para a API e encerra a sessao local quando ele expira (401). */
export const tokenInterceptor: HttpInterceptorFn = (req, next) => {
  const sessao = inject(Sessao);
  const token = sessao.token();
  const paraApi = req.url.startsWith(inject(API_URL));

  const requisicao =
    token && paraApi ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;

  return next(requisicao).pipe(
    catchError((erro: unknown) => {
      if (token && paraApi && erro instanceof HttpErrorResponse && erro.status === 401) {
        sessao.encerrar();
      }
      return throwError(() => erro);
    }),
  );
};
