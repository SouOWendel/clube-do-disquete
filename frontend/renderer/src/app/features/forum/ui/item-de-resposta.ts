import { DatePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { Icone } from '../../../shared/ui/icone/icone';
import { Resposta } from '../data-access/forum.models';

/**
 * Item da janela RESPOSTAS (N) — RF15 (Figma > Resposta).
 * O autor ve uma lixeira para excluir a propria resposta.
 */
@Component({
  selector: 'app-item-de-resposta',
  imports: [DatePipe, Icone],
  template: `
    <div class="flex w-full items-center gap-e2">
      <p class="m-0 flex min-w-0 flex-1 gap-e2 texto-corpo-pequeno">
        <span class="texto-rotulo-pequeno text-texto-padrao">{{
          resposta().autor.nome_usuario
        }}</span>
        <time class="text-texto-secundario" [attr.datetime]="resposta().criado_em">
          {{ resposta().criado_em | date: 'dd/MM HH:mm' }}
        </time>
      </p>
      @if (resposta().autoria) {
        <button
          type="button"
          class="flex cursor-pointer border border-solid border-transparent bg-transparent p-e1 text-texto-secundario hover:border-borda-sutil hover:text-acao-perigo focus-visible:border-dashed focus-visible:border-borda-padrao focus-visible:outline-none"
          aria-label="Excluir resposta"
          title="Excluir resposta"
          (click)="excluir.emit()"
        >
          <app-icone nome="lixeira" [tamanho]="16" />
        </button>
      }
    </div>
    <p class="m-0 w-full texto-corpo whitespace-pre-line text-texto-padrao">
      {{ resposta().corpo }}
    </p>
  `,
  host: {
    class:
      'flex w-full flex-col items-start gap-e2 border-b border-solid border-borda-sutil bg-fundo-superficie px-e4 py-e3',
  },
})
export class ItemDeResposta {
  readonly resposta = input.required<Resposta>();

  /** O autor pediu para excluir; quem usa o item confirma e chama a API. */
  readonly excluir = output<void>();
}
