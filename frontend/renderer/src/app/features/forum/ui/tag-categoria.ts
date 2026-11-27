import { Component } from '@angular/core';

/** Etiqueta com o nome da categoria do topico (Figma > Tag de categoria). */
@Component({
  selector: 'app-tag-categoria',
  template: '<ng-content />',
  host: {
    class:
      'inline-flex border border-solid border-borda-padrao bg-fundo-sutil px-e2 py-e1 ' +
      'texto-corpo-pequeno whitespace-nowrap text-texto-padrao',
  },
})
export class TagCategoria {}
