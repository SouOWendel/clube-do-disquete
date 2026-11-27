import { DatePipe } from '@angular/common';
import {
  Component,
  computed,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  errosDeCampo,
  mensagemGeral,
} from '../../../../core/api/mensagem-de-erro';
import { causaDoErro, valorDe } from '../../../../core/api/recurso';
import { Notificacoes } from '../../../../core/notificacoes/notificacoes';
import { Sessao } from '../../../../core/sessao/sessao';
import { TempoReal } from '../../../../core/tempo-real/tempo-real';
import { AreaDeTexto } from '../../../../shared/ui/area-de-texto/area-de-texto';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';
import { Dialogo } from '../../../../shared/ui/dialogo/dialogo';
import { Icone } from '../../../../shared/ui/icone/icone';
import { Janela } from '../../../../shared/ui/janela/janela';
import { TituloDePagina } from '../../../../shared/ui/titulo-de-pagina/titulo-de-pagina';
import { ForumApi } from '../../data-access/forum.api';
import {
  RespostaCriada,
  RespostaExcluida,
  TopicoAtualizado,
  TopicoExcluido,
} from '../../data-access/forum.eventos';
import { LIMITES, Resposta } from '../../data-access/forum.models';
import { iconeDaCategoria } from '../../ui/icone-da-categoria';
import { ItemDeResposta } from '../../ui/item-de-resposta';
import { TagCategoria } from '../../ui/tag-categoria';

/**
 * Pagina do topico (Figma > Pagina do topico, Pagina do topico — leitor e
 * Confirmar exclusao). EDITAR/EXCLUIR so aparecem para o autor.
 */
@Component({
  selector: 'app-pagina-topico',
  imports: [
    DatePipe,
    ReactiveFormsModule,
    RouterLink,
    AreaDeTexto,
    Aviso,
    Botao,
    Dialogo,
    Icone,
    ItemDeResposta,
    Janela,
    TagCategoria,
    TituloDePagina,
  ],
  templateUrl: './topico.html',
  host: { class: 'flex w-full flex-col gap-e4 px-e8 py-e4' },
})
export class PaginaTopico {
  private readonly api = inject(ForumApi);
  private readonly router = inject(Router);
  private readonly notificacoes = inject(Notificacoes);
  private readonly sessao = inject(Sessao);

  readonly id = input.required({ transform: numberAttribute });

  protected readonly LIMITE_RESPOSTA = LIMITES.respostaMax;

  protected readonly topico = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.topico(params),
  });

  /**
   * Respostas carregadas + as que chegaram depois (enviadas aqui ou recebidas
   * em tempo real), menos as excluidas, sem precisar recarregar a lista.
   */
  protected readonly enviadas = signal<Resposta[]>([]);
  private readonly excluidas = signal<ReadonlySet<number>>(new Set());
  private readonly carregadas = rxResource({
    params: () => this.id(),
    stream: ({ params }) => this.api.respostas(params),
  });
  protected readonly dados = computed(() => valorDe(this.topico));
  protected readonly respostas = computed(() => {
    const carregadas = valorDe(this.carregadas) ?? [];
    const ids = new Set(carregadas.map((r) => r.id_resposta));
    // a mesma resposta pode chegar pelo HTTP e pelo socket: entra uma vez so
    const novas = this.enviadas().filter((r) => !ids.has(r.id_resposta));
    return [...carregadas, ...novas].filter(
      (r) => !this.excluidas().has(r.id_resposta),
    );
  });

  protected readonly categoria = computed(() => this.dados()?.categoria);
  protected readonly icone = computed(() =>
    iconeDaCategoria(this.categoria()?.codigo),
  );
  protected readonly nomeCategoria = computed(
    () => this.categoria()?.nome.toUpperCase() ?? '',
  );

  protected readonly erroAoCarregar = computed(() => {
    const causa = causaDoErro(this.topico);
    if (!causa) return null;
    return (causa as { status?: number }).status === 404
      ? 'Este tópico não existe ou foi excluído.'
      : mensagemGeral(causa);
  });

  // Responder
  protected readonly formResposta = inject(NonNullableFormBuilder).group({
    corpo: [
      '',
      [Validators.required, Validators.maxLength(LIMITES.respostaMax)],
    ],
  });
  protected readonly enviando = signal(false);
  protected readonly erroResposta = signal<string | null>(null);

  protected responder(): void {
    const corpo = this.formResposta.controls.corpo.value.trim();
    if (!corpo) {
      this.erroResposta.set('Escreva sua mensagem antes de enviar.');
      return;
    }
    if (this.enviando()) return;

    this.enviando.set(true);
    this.erroResposta.set(null);
    this.api.responder(this.id(), corpo).subscribe({
      next: (nova) => {
        this.enviando.set(false);
        this.adicionarResposta(nova);
        this.formResposta.reset();
      },
      error: (erro: unknown) => {
        this.enviando.set(false);
        this.erroResposta.set(
          errosDeCampo(erro)['corpo'] ?? mensagemGeral(erro),
        );
      },
    });
  }

  // Excluir
  protected readonly confirmandoExclusao = signal(false);
  protected readonly excluindo = signal(false);
  protected readonly erroExclusao = signal<string | null>(null);

  protected readonly textoExclusao = computed(() => {
    const titulo = this.dados()?.titulo ?? '';
    const curto =
      titulo.length > 32 ? `${titulo.slice(0, 32).trimEnd()}…` : titulo;
    const total = this.respostas().length;
    const fim = 'Você voltará ao feed.';
    if (total === 0)
      return `O tópico "${curto}" será excluído permanentemente. ${fim}`;
    const respostas =
      total === 1 ? 'a resposta' : `todas as ${total} respostas`;
    return `O tópico "${curto}" e ${respostas} serão excluídos permanentemente. ${fim}`;
  });

  protected excluir(): void {
    if (this.excluindo()) return;
    this.excluindo.set(true);
    this.erroExclusao.set(null);
    this.api.excluirTopico(this.id()).subscribe({
      next: () => {
        this.notificacoes.mostrar('Tópico excluído.', 'sucesso');
        this.router.navigateByUrl('/');
      },
      error: (erro: unknown) => {
        this.excluindo.set(false);
        this.erroExclusao.set(mensagemGeral(erro));
      },
    });
  }

  protected voltarAoFeed(): void {
    this.router.navigateByUrl('/');
  }

  constructor() {
    const tempoReal = inject(TempoReal);
    const doTopicoAberto = <T extends { id_topico: number }>(evento: T) =>
      evento.id_topico === this.id();

    // RF15: respostas de outros usuarios entram na hora
    tempoReal
      .on<RespostaCriada>('resposta_criada')
      .pipe(takeUntilDestroyed())
      .subscribe(({ resposta }) => {
        if (doTopicoAberto(resposta)) this.adicionarResposta(resposta);
      });

    tempoReal
      .on<RespostaExcluida>('resposta_excluida')
      .pipe(takeUntilDestroyed())
      .subscribe((evento) => {
        if (!doTopicoAberto(evento)) return;
        this.excluidas.update((ids) => new Set(ids).add(evento.id_resposta));
      });

    // o autor editou em outra janela: mostra o texto novo sem recarregar
    tempoReal
      .on<TopicoAtualizado>('topico_atualizado')
      .pipe(takeUntilDestroyed())
      .subscribe(({ topico }) => {
        if (!doTopicoAberto(topico)) return;
        this.topico.set({
          ...topico,
          autoria: this.ehMeu(topico.autor.id_usuario),
        });
      });

    // RN06: o topico foi excluido por outra pessoa (ou em outra janela): volta ao feed
    tempoReal
      .on<TopicoExcluido>('topico_excluido')
      .pipe(takeUntilDestroyed())
      .subscribe((evento) => {
        if (!doTopicoAberto(evento) || this.excluindo()) return;
        this.notificacoes.mostrar(
          'Este tópico foi excluído pelo autor.',
          'info',
        );
        this.router.navigateByUrl('/');
      });
  }

  private adicionarResposta(resposta: Resposta): void {
    const comAutoria = {
      ...resposta,
      autoria: this.ehMeu(resposta.autor.id_usuario),
    };
    this.enviadas.update((lista) =>
      lista.some((r) => r.id_resposta === resposta.id_resposta)
        ? lista
        : [...lista, comAutoria],
    );
  }

  private ehMeu(idUsuario: number): boolean {
    return this.sessao.usuario()?.id_usuario === idUsuario;
  }
}
