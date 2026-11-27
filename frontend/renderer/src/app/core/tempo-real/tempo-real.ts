import { Injectable, effect, inject, signal } from '@angular/core';
import { Observable, Subject, filter, map } from 'rxjs';
import { io, Socket } from 'socket.io-client';
import { TEMPO_REAL_URL } from '../api/api-url';
import { Sessao } from '../sessao/sessao';

interface Evento {
  nome: string;
  dados: unknown;
}

/**
 * Conexao Socket.IO com o backend (RF09 / RF15). Abre quando ha sessao, com o
 * token JWT no handshake, e fecha no logout. As escritas continuam pela API
 * REST; por aqui so chegam os avisos do que mudou (RN08).
 */
@Injectable({ providedIn: 'root' })
export class TempoReal {
  private readonly sessao = inject(Sessao);
  private readonly url = inject(TEMPO_REAL_URL);
  private readonly eventos = new Subject<Evento>();
  private socket: Socket | null = null;

  readonly conectado = signal(false);

  constructor() {
    // reconecta sempre que o token muda (login, logout, troca de conta)
    effect(() => {
      const token = this.sessao.token();
      this.desconectar();
      if (token) this.conectar(token);
    });
  }

  /** Eventos de um tipo, ex.: `on<{ topico: TopicoResumo }>('topico_criado')`. */
  on<T>(nome: string): Observable<T> {
    return this.eventos.pipe(
      filter((evento) => evento.nome === nome),
      map((evento) => evento.dados as T),
    );
  }

  private conectar(token: string): void {
    const socket = io(this.url, {
      auth: { token },
      transports: ['websocket'],
    });
    socket.on('connect', () => this.conectado.set(true));
    socket.on('disconnect', () => this.conectado.set(false));
    socket.onAny((nome: string, dados: unknown) =>
      this.eventos.next({ nome, dados }),
    );
    this.socket = socket;
  }

  private desconectar(): void {
    this.socket?.disconnect();
    this.socket = null;
    this.conectado.set(false);
  }
}
