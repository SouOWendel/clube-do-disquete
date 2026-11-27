import { Component, computed, inject, input } from '@angular/core';
import { rxResource, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { debounceTime, merge, tap } from 'rxjs';
import { mensagemDoErro, valorDe } from '../../../../core/api/recurso';
import { TempoReal } from '../../../../core/tempo-real/tempo-real';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';
import { Janela } from '../../../../shared/ui/janela/janela';
import { Link } from '../../../../shared/ui/link/link';
import { ForumApi } from '../../data-access/forum.api';
import { TopicoCriado } from '../../data-access/forum.eventos';
import { Ordenacao } from '../../data-access/forum.models';
import { TopicosNovos } from '../../data-access/topicos-novos';
import { JanelaCategorias } from '../../ui/janela-categorias';
import { LinhaDeTopico } from '../../ui/linha-de-topico';

/**
 * Home do forum (Figma > Home e Categoria selecionada): boas-vindas,
 * CATEGORIAS, COMUNIDADE NOVA e o feed de topicos.
 * Categoria, ordenacao e busca vem do endereco (`/categoria/:codigo?ordenar=&busca=`).
 */
@Component({
  selector: 'app-feed',
  imports: [
    RouterLink,
    Aviso,
    Botao,
    Janela,
    JanelaCategorias,
    LinhaDeTopico,
    Link,
  ],
  templateUrl: './feed.html',
  host: { class: 'flex w-full flex-col gap-e6 p-e8' },
})
export class Feed {
  private readonly api = inject(ForumApi);
  protected readonly novos = inject(TopicosNovos);

  /** Parametros do endereco (withComponentInputBinding). */
  readonly codigo = input<string>();
  readonly ordenar = input<string>();
  readonly busca = input<string>();

  protected readonly ordem = computed<Ordenacao>(() =>
    this.ordenar() === 'em-alta' ? 'em-alta' : 'recentes',
  );

  protected readonly categorias = rxResource({
    stream: () => this.api.categorias(),
  });

  protected readonly topicos = rxResource({
    params: () => ({ categoria: this.codigo() ?? null, ordem: this.ordem() }),
    stream: ({ params }) => this.api.topicos(params.categoria, params.ordem),
  });

  protected readonly categoriaAtual = computed(() =>
    valorDe(this.categorias)?.find((c) => c.codigo === this.codigo()),
  );

  protected readonly caminho = computed(
    () =>
      `C:\\FÓRUM\\${(this.categoriaAtual()?.nome ?? 'Todos').toUpperCase()}`,
  );

  /** A busca da barra de tarefas filtra os titulos ja carregados. */
  protected readonly visiveis = computed(() => {
    const termo = this.busca()?.trim().toLocaleLowerCase('pt-BR');
    const lista = valorDe(this.topicos) ?? [];
    return termo
      ? lista.filter((t) => t.titulo.toLocaleLowerCase('pt-BR').includes(termo))
      : lista;
  });

  protected readonly listaCategorias = computed(
    () => valorDe(this.categorias) ?? [],
  );
  protected readonly erro = computed(() => mensagemDoErro(this.topicos));

  constructor() {
    // RF09 / RF15: qualquer mudanca no forum recarrega a lista. Recarregar (em vez
    // de inserir na mao) respeita a categoria, a ordem EM ALTA e o contador RESP.
    // O debounce junta rajadas (ex.: varias respostas seguidas) numa unica busca.
    const tempoReal = inject(TempoReal);
    merge(
      tempoReal
        .on<TopicoCriado>('topico_criado')
        .pipe(tap(({ topico }) => this.novos.marcar(topico.id_topico))),
      tempoReal.on('topico_atualizado'),
      tempoReal.on('topico_excluido'),
      tempoReal.on('resposta_criada'),
      tempoReal.on('resposta_excluida'),
    )
      .pipe(debounceTime(200), takeUntilDestroyed())
      .subscribe(() => this.topicos.reload());
  }
}
