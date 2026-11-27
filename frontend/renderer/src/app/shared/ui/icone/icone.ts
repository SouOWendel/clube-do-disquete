import { Component, computed, input } from '@angular/core';

/** Icones exportados do Figma (pagina Componentes > Icone/*). */
export type NomeIcone =
  | 'alerta'
  | 'busca'
  | 'cadeado'
  | 'chave'
  | 'check'
  | 'chip'
  | 'combo'
  | 'editar'
  | 'email'
  | 'enviar'
  | 'estetoscopio'
  | 'fechar'
  | 'grade'
  | 'lixeira'
  | 'mais'
  | 'maximizar'
  | 'mensagem'
  | 'minimizar'
  | 'monitor'
  | 'pasta'
  | 'sair'
  | 'seta-baixo'
  | 'tag'
  | 'usuario'
  | 'usuario-mais';

/**
 * Icone de traco do design system. O SVG e usado como mascara e pintado com
 * `currentColor`, entao a cor vem do texto do elemento pai (estado do campo,
 * barra de titulo, etc).
 */
@Component({
  selector: 'app-icone',
  template: '',
  host: {
    'aria-hidden': 'true',
    class: 'inline-block shrink-0 bg-current',
    '[style.width.px]': 'tamanho()',
    '[style.height.px]': 'tamanho()',
    '[style.mask]': 'mascara()',
  },
})
export class Icone {
  readonly nome = input.required<NomeIcone>();
  readonly tamanho = input(20);

  protected readonly mascara = computed(
    () => `url(assets/icones/${this.nome()}.svg) center / contain no-repeat`,
  );
}
