import {
  Component,
  DestroyRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';

/** Barra de tarefas do "Windows 95", fixa no fim da tela. */
@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.html',
})
export class Taskbar {
  /** Deixa o botão DRAW afundado enquanto a janela está aberta. */
  readonly drawOpen = input(false);
  readonly drawClick = output<void>();

  protected readonly time = signal(this.formatTime());

  constructor() {
    const timer = setInterval(() => this.time.set(this.formatTime()), 1000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  private formatTime(): string {
    return new Date().toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
