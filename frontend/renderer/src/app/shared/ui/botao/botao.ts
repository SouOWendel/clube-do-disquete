import { Component, computed, input } from '@angular/core';

export type EstiloBotao = 'primario' | 'secundario' | 'perigo';

const ESTILOS: Record<EstiloBotao, { solto: string; pressionado: string }> = {
  primario: {
    solto: 'bg-acao-primaria text-texto-inverso hover:bg-acao-primaria-hover active:bg-acao-primaria-hover',
    pressionado: 'bg-acao-primaria-hover text-texto-inverso',
  },
  secundario: {
    solto: 'bg-fundo-sutil text-texto-padrao hover:bg-fundo-superficie active:bg-fundo-superficie',
    pressionado: 'bg-fundo-superficie text-texto-padrao',
  },
  perigo: {
    solto: 'bg-acao-perigo text-texto-inverso hover:bg-acao-perigo-hover active:bg-acao-perigo-hover',
    pressionado: 'bg-acao-perigo-hover text-texto-inverso',
  },
};

/**
 * Botao retro com sombra solida (Figma > Botao).
 * Pressionado remove a sombra; foco usa contorno tracejado; desabilitado fica cinza.
 *
 * Uso: `<button appBotao estilo="secundario">CANCELAR</button>`
 * (tambem funciona em `<a appBotao routerLink="...">`). Use `[pressionado]`
 * para botoes de alternancia, como RECENTES / EM ALTA.
 */
@Component({
  selector: 'button[appBotao], a[appBotao]',
  template: '<ng-content />',
  host: {
    '[class]': 'classes()',
    '[attr.aria-pressed]': 'pressionado() ?? null',
  },
})
export class Botao {
  readonly estilo = input<EstiloBotao>('primario');
  /** Mantem o botao afundado (sem sombra). `undefined` = botao comum. */
  readonly pressionado = input<boolean>();

  protected readonly classes = computed(() => {
    const estilo = ESTILOS[this.estilo()];
    return (
      'texto-rotulo inline-flex cursor-pointer items-center justify-center gap-e2 whitespace-nowrap ' +
      'border-2 border-solid border-borda-padrao px-e4 py-e2 no-underline outline-none ' +
      'focus-visible:border-dashed active:shadow-none ' +
      'disabled:cursor-not-allowed disabled:border-borda-sutil disabled:bg-acao-desabilitada ' +
      'disabled:text-texto-desabilitado disabled:shadow-none ' +
      (this.pressionado() ? estilo.pressionado : `sombra-botao ${estilo.solto}`)
    );
  });
}
