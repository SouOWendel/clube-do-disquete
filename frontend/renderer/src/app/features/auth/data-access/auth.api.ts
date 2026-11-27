import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, finalize, tap } from 'rxjs';
import { API_URL } from '../../../core/api/api-url';
import { Sessao, Usuario } from '../../../core/sessao/sessao';

export interface DadosLogin {
  email: string;
  senha: string;
}

export interface DadosCadastro {
  email: string;
  nome_usuario: string;
  senha: string;
  confirmacao_senha: string;
  termos_aceitos: boolean;
}

interface RespostaSessao {
  token: string;
  usuario: Usuario;
}

interface RespostaDetalhe {
  detail: string;
}

/** Chamadas de /api/auth/ (backend/usuarios). Login e cadastro ja iniciam a sessao. */
@Injectable({ providedIn: 'root' })
export class AuthApi {
  private readonly http = inject(HttpClient);
  private readonly sessao = inject(Sessao);
  private readonly url = `${inject(API_URL)}/auth`;

  entrar(dados: DadosLogin): Observable<RespostaSessao> {
    return this.http
      .post<RespostaSessao>(`${this.url}/login/`, dados)
      .pipe(tap(({ token, usuario }) => this.sessao.iniciar(token, usuario)));
  }

  cadastrar(dados: DadosCadastro): Observable<RespostaSessao> {
    return this.http
      .post<RespostaSessao>(`${this.url}/cadastro/`, dados)
      .pipe(tap(({ token, usuario }) => this.sessao.iniciar(token, usuario)));
  }

  recuperarSenha(email: string): Observable<RespostaDetalhe> {
    return this.http.post<RespostaDetalhe>(`${this.url}/recuperar-senha/`, {
      email,
    });
  }

  /** Avisa o backend e limpa a sessao local mesmo se a chamada falhar. */
  sair(): Observable<RespostaDetalhe> {
    return this.http
      .post<RespostaDetalhe>(`${this.url}/logout/`, {})
      .pipe(finalize(() => this.sessao.encerrar()));
  }
}
