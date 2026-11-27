import { Injectable, Signal, signal } from '@angular/core';
import { NomeIcone } from '../icone/icone';

/** Janela minimizada, mostrada como botao na barra de tarefas. */
export interface JanelaMinimizada {
  id: number;
  titulo: Signal<string>;
  icone: Signal<NomeIcone | undefined>;
  restaurar: () => void;
}

/**
 * Estado compartilhado das janelas internas: quais estao minimizadas (para a
 * barra de tarefas) e qual fica por cima quando elas se sobrepoem.
 */
@Injectable({ providedIn: 'root' })
export class GerenciadorDeJanelas {
  private proximoId = 0;
  private camadaDoTopo = 0;
  readonly minimizadas = signal<readonly JanelaMinimizada[]>([]);

  novoId(): number {
    return this.proximoId++;
  }

  /** Camada (z-index) para trazer uma janela para frente das outras. */
  trazerParaFrente(): number {
    return ++this.camadaDoTopo;
  }

  minimizar(janela: JanelaMinimizada): void {
    this.minimizadas.update((lista) =>
      lista.some((j) => j.id === janela.id) ? lista : [...lista, janela],
    );
  }

  /** Tira da barra de tarefas (ao restaurar ou quando a tela da janela fecha). */
  remover(id: number): void {
    this.minimizadas.update((lista) => lista.filter((j) => j.id !== id));
  }
}
