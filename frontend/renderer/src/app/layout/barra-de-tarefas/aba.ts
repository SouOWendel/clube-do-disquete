import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icone, NomeIcone } from '../../shared/ui/icone/icone';

/**
 * Aba interna da barra de tarefas (Figma > Aba: Ativa, Inativa, Hover).
 * Ativa = afundada (branca, sem sombra); Inativa = solta, com sombra.
 */
@Component({
  selector: 'app-aba',
  imports: [Icone, RouterLink],
  template: `
    <a
      class="flex min-w-0 flex-1 items-center gap-e2 text-texto-padrao no-underline outline-none"
      [routerLink]="rota()"
      [attr.aria-current]="ativa() ? 'page' : null"
    >
      <app-icone [nome]="icone()" [tamanho]="16" class="text-texto-destaque" />
      <span
        class="min-w-0 flex-1 truncate"
        [class]="ativa() ? 'texto-rotulo-pequeno' : 'texto-corpo-pequeno'"
      >
        {{ nome() }}
      </span>
    </a>
    @if (fechavel()) {
      <button
        type="button"
        class="flex cursor-pointer border-0 bg-transparent p-0 text-texto-padrao"
        [attr.aria-label]="'Fechar ' + nome()"
        (click)="fechar.emit()"
      >
        <app-icone nome="fechar" [tamanho]="14" />
      </button>
    }
  `,
  host: {
    class:
      'flex w-[200px] shrink-0 items-center gap-e2 border-2 border-solid border-borda-padrao px-e3 py-e2 ' +
      'focus-within:border-dashed',
    '[class]': "ativa() ? 'bg-fundo-superficie' : 'bg-fundo-sutil sombra-botao hover:bg-fundo-hover'",
  },
})
export class Aba {
  readonly nome = input.required<string>();
  readonly icone = input.required<NomeIcone>();
  readonly rota = input.required<string>();
  readonly ativa = input(false);
  readonly fechavel = input(false);

  readonly fechar = output<void>();
}
