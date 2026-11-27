import {
  Component,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import { rxResource, toSignal } from '@angular/core/rxjs-interop';
import {
  NonNullableFormBuilder,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import {
  ErrosDeCampo,
  errosDeCampo,
  mensagemGeral,
} from '../../../../core/api/mensagem-de-erro';
import { mensagemDoErro, valorDe } from '../../../../core/api/recurso';
import { Notificacoes } from '../../../../core/notificacoes/notificacoes';
import { AreaDeTexto } from '../../../../shared/ui/area-de-texto/area-de-texto';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';
import { Campo } from '../../../../shared/ui/campo/campo';
import { mensagemDeValidacao } from '../../../../shared/ui/formulario/mensagem-de-validacao';
import { Janela } from '../../../../shared/ui/janela/janela';
import { OpcaoSeletor, Seletor } from '../../../../shared/ui/seletor/seletor';
import { TituloDePagina } from '../../../../shared/ui/titulo-de-pagina/titulo-de-pagina';
import { ForumApi } from '../../data-access/forum.api';
import { DadosTopico, LIMITES, Topico } from '../../data-access/forum.models';
import { TopicosNovos } from '../../data-access/topicos-novos';

type CampoTopico = keyof DadosTopico;

/** Mesmas regras do TopicoEscritaSerializer (backend/topicos/serializers.py). */
const MENSAGENS: Record<CampoTopico, Record<string, string>> = {
  categoria: { required: 'Escolha uma categoria.' },
  titulo: {
    required: 'Informe o assunto do tópico.',
    minlength: `O assunto precisa de no mínimo ${LIMITES.tituloMin} caracteres.`,
    maxlength: `O assunto pode ter no máximo ${LIMITES.tituloMax} caracteres.`,
  },
  corpo: {
    required: 'Conte sua dica ou dúvida.',
    minlength: `Escreva pelo menos ${LIMITES.corpoMin} caracteres.`,
  },
};

/** Valida o tamanho ignorando espacos nas pontas, como o backend faz. */
const semEspacos = (min: number, max?: number) => (c: { value: string }) => {
  const tamanho = c.value.trim().length;
  if (tamanho > 0 && tamanho < min) return { minlength: true };
  if (max && tamanho > max) return { maxlength: true };
  return null;
};

/**
 * Formulario de topico (Figma > Publicar topico e Editar topico). A mesma
 * tela atende os dois casos: sem `id` publica, com `id` edita.
 */
@Component({
  selector: 'app-formulario-topico',
  imports: [
    ReactiveFormsModule,
    AreaDeTexto,
    Aviso,
    Botao,
    Campo,
    Janela,
    Seletor,
    TituloDePagina,
  ],
  templateUrl: './formulario-topico.html',
  host: { class: 'flex w-full flex-col items-center p-e8' },
})
export class FormularioTopico {
  private readonly api = inject(ForumApi);
  private readonly router = inject(Router);
  private readonly notificacoes = inject(Notificacoes);
  private readonly novos = inject(TopicosNovos);

  /** Presente em `/topicos/:id/editar`. */
  readonly id = input(undefined, {
    transform: (v: unknown) => (v == null ? undefined : numberAttribute(v)),
  });
  protected readonly editando = computed(() => this.id() !== undefined);

  protected readonly form = inject(NonNullableFormBuilder).group({
    categoria: ['', Validators.required],
    titulo: [
      '',
      [Validators.required, semEspacos(LIMITES.tituloMin, LIMITES.tituloMax)],
    ],
    corpo: ['', [Validators.required, semEspacos(LIMITES.corpoMin)]],
  });

  private readonly valores = toSignal(this.form.valueChanges, {
    initialValue: this.form.value,
  });

  protected readonly opcoes = toSignal(this.api.categorias(), {
    initialValue: [],
  });
  protected readonly opcoesSeletor = computed<OpcaoSeletor[]>(() =>
    this.opcoes().map((c) => ({ valor: c.codigo, rotulo: c.nome })),
  );

  /** No modo edicao, carrega o topico e preenche o formulario. */
  protected readonly original = rxResource({
    params: () => this.id(),
    stream: ({ params }) =>
      params === undefined ? of(undefined) : this.api.topico(params),
  });

  constructor() {
    effect(() => {
      const topico = valorDe(this.original);
      if (topico) this.preencher(topico);
    });
  }

  protected readonly caminho = computed(() => {
    const topico = valorDe(this.original);
    if (!this.editando()) return 'C:\\FÓRUM\\NOVO TÓPICO';
    return `C:\\FÓRUM\\${topico?.categoria.nome.toUpperCase() ?? 'TÓPICO'}\\EDITAR`;
  });

  protected readonly ajudaTitulo = computed(() => {
    const tamanho = (this.valores().titulo ?? '').trim().length;
    return tamanho
      ? `${tamanho} / ${LIMITES.tituloMax} caracteres.`
      : `Seja direto: ${LIMITES.tituloMin} a ${LIMITES.tituloMax} caracteres.`;
  });

  protected readonly semPermissao = computed(
    () => valorDe(this.original)?.autoria === false,
  );
  protected readonly erroAoCarregar = computed(() =>
    mensagemDoErro(this.original),
  );

  protected readonly enviando = signal(false);
  protected readonly tentouEnviar = signal(false);
  protected readonly erroGeral = signal<string | null>(null);
  protected readonly errosServidor = signal<ErrosDeCampo>({});

  protected erro(campo: CampoTopico): string | null {
    // Le os valores para recalcular a mensagem enquanto o usuario digita.
    this.valores();
    return (
      this.errosServidor()[campo] ??
      mensagemDeValidacao(
        this.form.controls[campo],
        MENSAGENS[campo],
        this.tentouEnviar(),
      )
    );
  }

  protected salvar(): void {
    this.tentouEnviar.set(true);
    this.erroGeral.set(null);
    this.errosServidor.set({});
    this.form.markAllAsTouched();
    if (this.form.invalid || this.enviando()) return;

    const dados = this.form.getRawValue();
    const id = this.id();
    this.enviando.set(true);

    const requisicao =
      id === undefined
        ? this.api.criarTopico(dados)
        : this.api.editarTopico(id, dados);
    requisicao.subscribe({
      next: (topico) => {
        if (id === undefined) {
          this.novos.marcar(topico.id_topico);
          this.notificacoes.mostrar(
            'Tópico publicado! Ele já aparece no feed para todos.',
          );
          this.router.navigateByUrl('/');
        } else {
          this.notificacoes.mostrar('Alterações salvas.');
          this.router.navigate(['/topicos', id]);
        }
      },
      error: (erro: unknown) => {
        this.enviando.set(false);
        this.errosServidor.set(errosDeCampo(erro));
        this.erroGeral.set(mensagemGeral(erro));
      },
    });
  }

  protected cancelar(): void {
    const id = this.id();
    this.router.navigate(id === undefined ? ['/'] : ['/topicos', id]);
  }

  private preencher(topico: Topico): void {
    this.form.setValue({
      categoria: topico.categoria.codigo,
      titulo: topico.titulo,
      corpo: topico.corpo,
    });
  }
}
