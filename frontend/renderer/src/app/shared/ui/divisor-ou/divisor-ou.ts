import { Component } from '@angular/core';

/** Divisor com o texto "OU" ao centro (Figma > Divisor OU). */
@Component({
  selector: 'app-divisor-ou',
  template: `
    <span class="h-0.5 min-w-px flex-1 bg-borda-sutil"></span>
    <span class="texto-rotulo-pequeno text-texto-secundario">OU</span>
    <span class="h-0.5 min-w-px flex-1 bg-borda-sutil"></span>
  `,
  host: { role: 'separator', class: 'flex w-full items-center gap-e3' },
})
export class DivisorOu {}
