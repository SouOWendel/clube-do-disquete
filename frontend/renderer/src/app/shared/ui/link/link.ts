import { Directive } from '@angular/core';

/**
 * Link de texto (Figma > Link: Padrao, Hover).
 * Uso: `<a appLink routerLink="/cadastro">Criar agora</a>`
 */
@Directive({
  selector: 'a[appLink], button[appLink]',
  host: {
    class:
      'texto-rotulo-pequeno cursor-pointer border-0 bg-transparent p-0 text-texto-destaque ' +
      'no-underline hover:underline focus-visible:underline focus-visible:outline-none',
  },
})
export class Link {}
