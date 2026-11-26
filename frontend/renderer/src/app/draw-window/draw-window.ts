import { Component, output } from '@angular/core';

/** Janela estilo Windows 95 do programa "Draw", com um canvas. */
@Component({
  selector: 'app-draw-window',
  templateUrl: './draw-window.html',
})
export class DrawWindow {
  readonly closed = output<void>();
}
