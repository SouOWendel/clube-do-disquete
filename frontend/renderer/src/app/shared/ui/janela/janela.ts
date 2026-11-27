import { Component, input, output } from '@angular/core';
import { Icone, NomeIcone } from '../icone/icone';

/** Quais botoes aparecem na barra de titulo (Figma > Controle de janela). */
export type ControlesJanela = 'todos' | 'fechar' | 'nenhum';

/**
 * Janela interna estilo Windows 95 (Figma > Barra de titulo + frame com
 * borda 2px e Sombra/Janela). O conteudo e projetado no corpo.
 *
 * Uso: `<app-janela titulo="CATEGORIAS" icone="pasta" corpo="p-e4 gap-e3">...</app-janela>`
 */
@Component({
  selector: 'app-janela',
  imports: [Icone],
  templateUrl: './janela.html',
  styleUrl: './janela.css',
  host: {
    role: 'region',
    '[attr.aria-label]': 'titulo()',
    class: 'flex flex-col border-2 border-solid border-borda-padrao bg-fundo-superficie sombra-janela',
  },
})
export class Janela {
  readonly titulo = input.required<string>();
  readonly icone = input<NomeIcone>();
  readonly controles = input<ControlesJanela>('todos');
  /** Espacamento do corpo (classes Tailwind). O padrao segue as janelas de formulario. */
  readonly corpo = input('p-e6 gap-e4');

  readonly minimizar = output<void>();
  readonly maximizar = output<void>();
  readonly fechar = output<void>();
}
