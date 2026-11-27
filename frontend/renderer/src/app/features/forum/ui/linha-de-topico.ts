import { DatePipe } from '@angular/common';
import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icone } from '../../../shared/ui/icone/icone';
import { TopicoResumo } from '../data-access/forum.models';
import { TagCategoria } from './tag-categoria';

/**
 * Item do feed (RF05): titulo, categoria, RESP. e CRIADO (DD/MM).
 * `novo` destaca o topico com fundo de destaque e selo NOVO (Figma > Linha de topico).
 */
@Component({
  selector: 'app-linha-de-topico',
  imports: [DatePipe, RouterLink, Icone, TagCategoria],
  template: `
    <a
      class="flex w-full items-center gap-e4 px-e4 py-e3 text-texto-padrao no-underline outline-none focus-visible:outline-1 focus-visible:outline-dashed focus-visible:-outline-offset-4"
      [class]="novo() ? 'bg-fundo-destaque' : 'bg-fundo-superficie hover:bg-fundo-hover'"
      [routerLink]="['/topicos', topico().id_topico]"
    >
      <span
        class="flex size-8 shrink-0 items-center justify-center border border-solid border-borda-destaque bg-fundo-sutil text-texto-destaque"
      >
        <app-icone nome="mensagem" />
      </span>
      <span class="flex min-w-0 flex-1 flex-col items-start gap-e2">
        <span class="flex max-w-full items-center gap-e2">
          <span class="truncate texto-rotulo">{{ topico().titulo }}</span>
          @if (novo()) {
            <span class="shrink-0 bg-acao-primaria px-e2 py-e1 texto-rotulo-pequeno text-texto-inverso">NOVO</span>
          }
        </span>
        <app-tag-categoria>{{ topico().categoria.nome }}</app-tag-categoria>
      </span>
      <span class="w-16 shrink-0 text-center texto-rotulo">{{ topico().total_respostas }}</span>
      <span class="w-18 shrink-0 text-center texto-corpo">{{ topico().criado_em | date: 'dd/MM' }}</span>
    </a>
  `,
  host: { class: 'block border-b border-solid border-borda-sutil' },
})
export class LinhaDeTopico {
  readonly topico = input.required<TopicoResumo>();
  readonly novo = input(false);
}
