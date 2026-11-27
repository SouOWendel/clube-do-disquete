import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { Resposta } from '../data-access/forum.models';

/** Item da janela RESPOSTAS (N) — RF15 (Figma > Resposta). */
@Component({
  selector: 'app-item-de-resposta',
  imports: [DatePipe],
  template: `
    <p class="m-0 flex gap-e2 texto-corpo-pequeno">
      <span class="texto-rotulo-pequeno text-texto-padrao">{{ resposta().autor.nome_usuario }}</span>
      <time class="text-texto-secundario" [attr.datetime]="resposta().criado_em">
        {{ resposta().criado_em | date: 'dd/MM HH:mm' }}
      </time>
    </p>
    <p class="m-0 w-full texto-corpo whitespace-pre-line text-texto-padrao">{{ resposta().corpo }}</p>
  `,
  host: {
    class:
      'flex w-full flex-col items-start gap-e2 border-b border-solid border-borda-sutil bg-fundo-superficie px-e4 py-e3',
  },
})
export class ItemDeResposta {
  readonly resposta = input.required<Resposta>();
}
