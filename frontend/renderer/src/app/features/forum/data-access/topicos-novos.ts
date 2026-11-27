import { Injectable, signal } from '@angular/core';

/**
 * Topicos publicados nesta sessao, destacados no feed com o selo NOVO
 * (Figma > Linha de topico "Nova"). Quando o Socket.IO (RF09) existir,
 * os topicos recebidos em tempo real entram aqui tambem.
 */
@Injectable({ providedIn: 'root' })
export class TopicosNovos {
  private readonly ids = signal<ReadonlySet<number>>(new Set());

  marcar(id: number): void {
    this.ids.update((ids) => new Set(ids).add(id));
  }

  eNovo(id: number): boolean {
    return this.ids().has(id);
  }
}
