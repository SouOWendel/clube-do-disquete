import { Component, signal } from '@angular/core';
import { DrawWindow } from './draw-window/draw-window';
import { Taskbar } from './taskbar/taskbar';

@Component({
  imports: [Taskbar, DrawWindow],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly drawOpen = signal(false);
}
