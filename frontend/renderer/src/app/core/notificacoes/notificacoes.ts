import { Injectable, signal } from '@angular/core';
import { TipoAviso } from '../../shared/ui/aviso/aviso';

export interface Notificacao {
  id: number;
  tipo: TipoAviso;
  mensagem: string;
}

const DURACAO_MS = 5000;

/** Avisos temporarios no canto da tela (ex.: "Topico publicado!"). */
@Injectable({ providedIn: 'root' })
export class Notificacoes {
  private proximoId = 0;
  readonly lista = signal<readonly Notificacao[]>([]);

  mostrar(mensagem: string, tipo: TipoAviso = 'sucesso'): void {
    const id = this.proximoId++;
    this.lista.update((lista) => [...lista, { id, tipo, mensagem }]);
    setTimeout(() => this.dispensar(id), DURACAO_MS);
  }

  dispensar(id: number): void {
    this.lista.update((lista) => lista.filter((n) => n.id !== id));
  }
}
