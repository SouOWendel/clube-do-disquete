import { Component, computed, input } from '@angular/core';

export type EstiloBotao = 'primario' | 'secundario' | 'perigo';

const ESTILOS: Record<EstiloBotao, string> = {
  primario:
    'bg-acao-primaria text-texto-inverso hover:bg-acao-primaria-hover active:bg-acao-primaria-hover',
  secundario: 'bg-fundo-sutil text-texto-padrao hover:bg-fundo-superficie active:bg-fundo-superficie',
  perigo: 'bg-acao-perigo text-texto-inverso hover:bg-acao-perigo-hover active:bg-acao-perigo-hover',
};

/**
 * Botao retro com sombra solida (Figma > Botao).
 * Pressionado remove a sombra; foco usa contorno tracejado; desabilitado fica cinza.
 *
 * Uso: `<button appBotao estilo="secundario">CANCELAR</button>`
 * (tambem funciona em `<a appBotao routerLink="...">`).
 */
@Component({
  selector: 'button[appBotao], a[appBotao]',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
  },
})
export class Botao {
  readonly estilo = input<EstiloBotao>('primario');

  protected readonly classes = computed(
    () =>
      'texto-rotulo inline-flex cursor-pointer items-center justify-center gap-e2 whitespace-nowrap ' +
      'border-2 border-solid border-borda-padrao px-e4 py-e2 no-underline sombra-botao outline-none ' +
      'focus-visible:border-dashed active:shadow-none ' +
      'disabled:cursor-not-allowed disabled:border-borda-sutil disabled:bg-acao-desabilitada ' +
      'disabled:text-texto-desabilitado disabled:shadow-none ' +
      ESTILOS[this.estilo()],
  );
}
