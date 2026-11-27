import { Component, input, output } from '@angular/core';
import { Icone, NomeIcone } from '../icone/icone';

/**
 * Janela interna estilo Windows 95 (Figma > Barra de titulo + frame com
 * borda 2px e Sombra/Janela). O conteudo e projetado no corpo.
 */
@Component({
  selector: 'app-janela',
  imports: [Icone],
  templateUrl: './janela.html',
  styleUrl: './janela.css',
  host: {
    role: 'dialog',
    '[attr.aria-label]': 'titulo()',
    class:
      'janela flex flex-col border-2 border-solid border-borda-padrao bg-fundo-superficie sombra-janela',
  },
})
export class Janela {
  readonly titulo = input.required<string>();
  readonly icone = input<NomeIcone>();

  readonly minimizar = output<void>();
  readonly maximizar = output<void>();
  readonly fechar = output<void>();
}
