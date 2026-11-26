import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
    }).compileComponents();
  });

  it('cria o app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('abre e fecha a janela Draw pela barra de tarefas', async () => {
    const fixture = TestBed.createComponent(App);
    const el = fixture.nativeElement as HTMLElement;
    await fixture.whenStable();

    expect(el.querySelector('app-draw-window')).toBeNull();

    el.querySelector<HTMLButtonElement>('app-taskbar button')!.click();
    await fixture.whenStable();
    expect(el.querySelector('app-draw-window')).not.toBeNull();

    el.querySelector<HTMLButtonElement>('[aria-label="Fechar"]')!.click();
    await fixture.whenStable();
    expect(el.querySelector('app-draw-window')).toBeNull();
  });
});
