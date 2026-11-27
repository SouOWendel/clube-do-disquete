import {
  Component,
  ElementRef,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { Janela } from '../janela/janela';
import { NomeIcone } from '../icone/icone';

/**
 * Janela modal sobre a area de trabalho (Figma > Sobreposicao + Dialogo).
 * Usa o `<dialog>` nativo: prende o foco, fecha com Esc e escurece o fundo.
 *
 * Uso: `<app-dialogo [aberto]="x()" titulo="EXCLUIR TOPICO?" (fechar)="x.set(false)">...</app-dialogo>`
 */
@Component({
  selector: 'app-dialogo',
  imports: [Janela],
  template: `
    <dialog
      #dialogo
      class="m-auto overflow-visible border-0 bg-transparent p-0 backdrop:bg-sobreposicao"
      [style.width.px]="largura()"
      (cancel)="$event.preventDefault(); fechar.emit()"
    >
      @if (aberto()) {
        <app-janela
          [titulo]="titulo()"
          [icone]="icone()"
          controles="fechar"
          (fechar)="fechar.emit()"
        >
          <ng-content />
        </app-janela>
      }
    </dialog>
  `,
})
export class Dialogo {
  readonly aberto = input(false);
  readonly titulo = input.required<string>();
  readonly icone = input<NomeIcone>();
  readonly largura = input(520);

  readonly fechar = output<void>();

  private readonly dialogo =
    viewChild.required<ElementRef<HTMLDialogElement>>('dialogo');

  constructor() {
    effect(() => {
      const elemento = this.dialogo().nativeElement;
      if (this.aberto() && !elemento.open) elemento.showModal();
      if (!this.aberto() && elemento.open) elemento.close();
    });
  }
}
