import { Component } from '@angular/core';

/** Caminho da tela no estilo DOS, ex.: `C:\FORUM\NOVO TOPICO` (Figma > Titulo/Pagina). */
@Component({
  selector: 'app-titulo-de-pagina',
  template:
    '<h1 class="m-0 texto-titulo-pagina text-texto-inverso"><ng-content /></h1>',
})
export class TituloDePagina {}
