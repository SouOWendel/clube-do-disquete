import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, withComponentInputBinding } from '@angular/router';
import { RouterTestingHarness } from '@angular/router/testing';
import { routes } from '../../app.routes';
import { Notificacoes } from '../../core/notificacoes/notificacoes';
import { Sessao } from '../../core/sessao/sessao';
import { tokenInterceptor } from '../../core/sessao/token.interceptor';
import { Categoria, Topico } from './data-access/forum.models';

const API = 'http://localhost:8000/api';

const CATEGORIAS: Categoria[] = [
  { id_categoria: 1, codigo: 'precos-e-promocoes', nome: 'Preços e promoções' },
  { id_categoria: 4, codigo: 'conserto-e-diagnostico', nome: 'Conserto e diagnóstico' },
];

const TOPICO: Topico = {
  id_topico: 7,
  titulo: 'PC liga e desliga em 3 segundos',
  corpo: 'Montei um PC com peças usadas e ele liga e desliga sozinho.',
  categoria: CATEGORIAS[1],
  autor: { id_usuario: 1, nome_usuario: 'pedro_old' },
  total_respostas: 0,
  criado_em: '2026-11-20T17:08:00-03:00',
  atualizado_em: '2026-11-20T17:08:00-03:00',
  autoria: true,
};

describe('Forum', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    // O jsdom ainda nao implementa o <dialog> modal.
    HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
      this.open = true;
    };
    HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
      this.open = false;
    };
    TestBed.configureTestingModule({
      providers: [
        provideRouter(routes, withComponentInputBinding()),
        provideHttpClient(withInterceptors([tokenInterceptor])),
        provideHttpClientTesting(),
      ],
    });
    http = TestBed.inject(HttpTestingController);
  });

  function entrar(): void {
    TestBed.inject(Sessao).iniciar('token-teste', {
      id_usuario: 1,
      email: 'pedro@disquete.com',
      nome_usuario: 'pedro_old',
      termos_aceitos: true,
      possui_senha: true,
      google_vinculado: false,
      criado_em: '2026-11-20T17:08:00-03:00',
    });
  }

  it('manda visitantes do feed para o login', async () => {
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');
    expect(TestBed.inject(Router).url).toBe('/entrar');
  });

  it('manda quem ja esta logado do login para o feed', async () => {
    entrar();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/entrar');
    expect(TestBed.inject(Router).url).toBe('/');
  });

  it('lista os topicos da categoria com o token na requisicao', async () => {
    entrar();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/categoria/conserto-e-diagnostico?ordenar=em-alta');

    http.expectOne(`${API}/categorias/`).flush(CATEGORIAS);
    const req = http.expectOne(
      (r) => r.url === `${API}/topicos/` && r.params.get('categoria') === 'conserto-e-diagnostico',
    );
    expect(req.request.params.get('ordenar')).toBe('em-alta');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-teste');
    req.flush([TOPICO]);
    await harness.fixture.whenStable();

    const tela = harness.routeNativeElement!;
    expect(tela.textContent).toContain('C:\\FÓRUM\\CONSERTO E DIAGNÓSTICO');
    expect(tela.textContent).toContain('PC liga e desliga em 3 segundos');
  });

  it('mostra um aviso, sem quebrar a tela, quando a API esta fora do ar', async () => {
    entrar();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/');

    const semConexao = new ProgressEvent('error');
    http.expectOne(`${API}/categorias/`).error(semConexao, { status: 0 });
    http.expectOne((r) => r.url === `${API}/topicos/`).error(semConexao, { status: 0 });
    await harness.fixture.whenStable();

    const tela = harness.routeNativeElement!;
    expect(tela.textContent).toContain('Não foi possível conectar ao servidor');
    expect(tela.textContent).toContain('C:\\FÓRUM\\TODOS');
  });

  it('valida o formulario de novo topico antes de enviar', async () => {
    entrar();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/topicos/novo');
    http.expectOne(`${API}/categorias/`).flush(CATEGORIAS);
    await harness.fixture.whenStable();

    const tela = harness.routeNativeElement!;
    tela.querySelector<HTMLButtonElement>('button[type="submit"]')!.click();
    await harness.fixture.whenStable();

    expect(tela.textContent).toContain('Escolha uma categoria.');
    expect(tela.textContent).toContain('Informe o assunto do tópico.');
    expect(tela.textContent).toContain('Conte sua dica ou dúvida.');
    http.expectNone(`${API}/topicos/`);
  });

  it('mostra EDITAR e EXCLUIR so para o autor e exclui apos confirmar', async () => {
    entrar();
    const harness = await RouterTestingHarness.create();
    await harness.navigateByUrl('/topicos/7');
    http.expectOne(`${API}/topicos/7/`).flush(TOPICO);
    http.expectOne(`${API}/topicos/7/respostas/`).flush([]);
    await harness.fixture.whenStable();

    const tela = harness.routeNativeElement!;
    expect(tela.textContent).toContain('EDITAR');
    const botoes = () => [...tela.querySelectorAll<HTMLButtonElement>('button')];
    botoes().find((b) => b.textContent?.includes('EXCLUIR'))!.click();
    await harness.fixture.whenStable();

    const dialogo = tela.querySelector('dialog')!;
    [...dialogo.querySelectorAll<HTMLButtonElement>('button')]
      .find((b) => b.textContent?.trim() === 'EXCLUIR')!
      .click();
    http.expectOne({ url: `${API}/topicos/7/`, method: 'DELETE' }).flush(null);
    await new Promise((resolver) => setTimeout(resolver));

    // Voltou ao feed, que ja pede as categorias e a lista atualizada.
    expect(TestBed.inject(Router).url).toBe('/');
    http.expectOne(`${API}/categorias/`).flush(CATEGORIAS);
    http.expectOne((r) => r.url === `${API}/topicos/`).flush([]);
    await harness.fixture.whenStable();
    expect(TestBed.inject(Notificacoes).lista().map((n) => n.mensagem)).toContain('Tópico excluído.');
  });

  afterEach(() => http.match(() => true));
});
