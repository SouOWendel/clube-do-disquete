import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icone } from '../../../shared/ui/icone/icone';
import { Janela } from '../../../shared/ui/janela/janela';
import { Categoria } from '../data-access/forum.models';
import { iconeDaCategoria } from './icone-da-categoria';

/**
 * Janela CATEGORIAS do feed (RF06): TODAS + as 6 categorias
 * (Figma > Item de categoria: Padrao, Hover, Selecionado).
 */
@Component({
  selector: 'app-janela-categorias',
  imports: [RouterLink, Icone, Janela],
  template: `
    <app-janela titulo="CATEGORIAS" corpo="">
      <nav class="flex w-full flex-col" aria-label="Categorias">
        <a
          [class]="classes(!selecionada())"
          routerLink="/"
          queryParamsHandling="merge"
        >
          <app-icone nome="grade" />
          TODAS
        </a>
        @for (categoria of categorias(); track categoria.codigo) {
          <a
            [class]="classes(categoria.codigo === selecionada())"
            [routerLink]="['/categoria', categoria.codigo]"
            queryParamsHandling="merge"
          >
            <app-icone [nome]="icone(categoria.codigo)" />
            {{ categoria.nome }}
          </a>
        }
      </nav>
    </app-janela>
  `,
})
export class JanelaCategorias {
  readonly categorias = input.required<readonly Categoria[]>();
  /** Codigo da categoria ativa; `null` = TODAS. */
  readonly selecionada = input<string | null>(null);

  protected readonly icone = iconeDaCategoria;

  protected classes(ativa: boolean): string {
    return (
      'flex w-full items-center gap-e3 border-b border-solid border-borda-sutil px-e3 py-e2 ' +
      'no-underline outline-none focus-visible:outline-1 focus-visible:outline-dashed focus-visible:-outline-offset-4 ' +
      (ativa
        ? 'bg-acao-primaria texto-rotulo text-texto-inverso'
        : 'bg-fundo-superficie texto-corpo text-texto-padrao hover:bg-fundo-hover')
    );
  }
}
