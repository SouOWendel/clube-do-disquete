import { provideHttpClient } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { App } from './app';
import { routes } from './app.routes';
import { Sessao } from './core/sessao/sessao';

describe('App', () => {
  beforeEach(async () => {
    localStorage.clear();
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter(routes), provideHttpClient()],
    }).compileComponents();
  });

  it('mostra o botao ENTRAR na barra de tarefas para visitantes', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const el = fixture.nativeElement as HTMLElement;

    const entrar = el.querySelector<HTMLAnchorElement>(
      'app-barra-de-tarefas a[href$="/entrar"]',
    );
    expect(entrar?.textContent?.trim()).toBe('ENTRAR');
  });

  it('mostra o usuario e o botao SAIR quando ha sessao', async () => {
    TestBed.inject(Sessao).iniciar('token', {
      id_usuario: 1,
      email: 'pedro@disquete.com',
      nome_usuario: 'pedro_old',
      termos_aceitos: true,
      possui_senha: true,
      google_vinculado: false,
      criado_em: '2026-11-20T17:08:00-03:00',
    });
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const barra = (fixture.nativeElement as HTMLElement).querySelector(
      'app-barra-de-tarefas',
    )!;

    expect(barra.textContent).toContain('pedro_old');
    expect(barra.textContent).toContain('SAIR');
  });

  it('abre a tela de login na raiz', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/entrar');
    expect(harness.routeNativeElement?.textContent).toContain(
      'ENTRAR NO FÓRUM',
    );
  });

  it('mostra os erros do formulario de login ao enviar vazio', async () => {
    const harness = await RouterTestingHarness.create('/entrar');
    const tela = harness.routeNativeElement!;

    tela.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await harness.fixture.whenStable();

    expect(tela.textContent).toContain('Informe seu e-mail.');
    expect(tela.textContent).toContain('Informe sua senha.');
  });
});
