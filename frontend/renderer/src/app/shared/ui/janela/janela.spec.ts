import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GerenciadorDeJanelas } from './gerenciador-de-janelas';
import { Janela } from './janela';

@Component({
  imports: [Janela],
  template: `
    <app-janela titulo="CATEGORIAS" icone="pasta">conteudo</app-janela>
  `,
})
class Hospedeiro {}

describe('Janela', () => {
  function montar() {
    const fixture = TestBed.createComponent(Hospedeiro);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const janela = el.querySelector<HTMLElement>('app-janela')!;
    return {
      fixture,
      janela,
      gerenciador: TestBed.inject(GerenciadorDeJanelas),
    };
  }

  it('minimiza para a barra de tarefas e restaura no mesmo lugar', async () => {
    const { fixture, janela, gerenciador } = montar();

    janela
      .querySelector<HTMLButtonElement>('button[aria-label="Minimizar"]')!
      .click();
    await fixture.whenStable();

    expect(janela.style.visibility).toBe('hidden');
    expect(gerenciador.minimizadas().map((j) => j.titulo())).toEqual([
      'CATEGORIAS',
    ]);

    gerenciador.minimizadas()[0].restaurar();
    await fixture.whenStable();

    expect(janela.style.visibility).toBe('');
    expect(gerenciador.minimizadas()).toEqual([]);
  });

  it('tira o botao da barra de tarefas quando a tela da janela fecha', async () => {
    const { fixture, janela, gerenciador } = montar();

    janela
      .querySelector<HTMLButtonElement>('button[aria-label="Minimizar"]')!
      .click();
    await fixture.whenStable();
    fixture.destroy();

    expect(gerenciador.minimizadas()).toEqual([]);
  });
});
