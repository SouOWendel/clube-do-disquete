import { Component, computed, input } from '@angular/core';

/** Tamanho original do componente Logo no Figma. */
const LARGURA_BASE = 470;
const ALTURA_BASE = 185;

/**
 * Logo oficial "Clube do Disquete" (Figma > Logo): "Clube do" + "Disquete"
 * inclinados em 3D. Desenhado no tamanho original e reduzido por escala
 * proporcional, como pede a descricao do componente.
 */
@Component({
  selector: 'app-logo',
  templateUrl: './logo.html',
  styleUrl: './logo.css',
  host: {
    role: 'img',
    'aria-label': 'Clube do Disquete',
    '[style.width.px]': 'largura()',
    '[style.height.px]': 'altura()',
  },
})
export class Logo {
  /** Largura em px; a altura acompanha a proporcao do logo. */
  readonly largura = input(264);

  protected readonly escala = computed(() => this.largura() / LARGURA_BASE);
  protected readonly altura = computed(() => ALTURA_BASE * this.escala());
}
