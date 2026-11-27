import { Component, input } from '@angular/core';
import { Icone } from '../icone/icone';

/**
 * Linha abaixo dos controles: mensagem de erro (com alerta) ou texto de ajuda,
 * com um contador opcional a direita (Figma > Campo/Area de texto > Ajuda/Rodape).
 */
@Component({
  selector: 'app-mensagem-de-ajuda',
  imports: [Icone],
  template: `
    @if (erro(); as mensagem) {
      <span class="flex min-w-0 flex-1 items-center gap-e1">
        <app-icone nome="alerta" [tamanho]="14" />
        {{ mensagem }}
      </span>
    } @else {
      <span class="min-w-0 flex-1">{{ ajuda() }}</span>
    }
    @if (contador(); as texto) {
      <span class="shrink-0 whitespace-nowrap">{{ texto }}</span>
    }
  `,
  host: {
    class: 'flex w-full items-start gap-e4 texto-corpo-pequeno',
    '[class.text-texto-erro]': '!!erro()',
    '[class.text-texto-secundario]': '!erro()',
  },
})
export class MensagemDeAjuda {
  readonly ajuda = input<string>();
  readonly erro = input<string | null>(null);
  readonly contador = input<string>();
}
