import {
  Component,
  DestroyRef,
  ElementRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { Icone, NomeIcone } from '../icone/icone';
import { GerenciadorDeJanelas } from './gerenciador-de-janelas';

/** Quais botoes aparecem na barra de titulo (Figma > Controle de janela). */
export type ControlesJanela = 'todos' | 'fechar' | 'nenhum';

/** Parte do titulo que precisa continuar na tela ao arrastar. */
const MARGEM_VISIVEL = 80;
/** Altura reservada para a barra de tarefas no rodape. */
const ALTURA_BARRA_DE_TAREFAS = 56;

interface Arraste {
  ponteiroX: number;
  ponteiroY: number;
  inicioX: number;
  inicioY: number;
  retangulo: DOMRect;
}

/**
 * Janela interna estilo Windows 95 (Figma > Barra de titulo + frame com
 * borda 2px e Sombra/Janela). O conteudo e projetado no corpo.
 *
 * - Arrastar pela barra de titulo move a janela. O deslocamento e um
 *   `transform` a partir do lugar dela no layout, entao as telas continuam
 *   montadas com flex normalmente.
 * - Minimizar esconde a janela (o espaco dela fica reservado, como no
 *   Windows) e cria um botao na barra de tarefas para restaurar.
 *
 * Uso: `<app-janela titulo="CATEGORIAS" icone="pasta" corpo="p-e4 gap-e3">...</app-janela>`
 */
@Component({
  selector: 'app-janela',
  imports: [Icone],
  templateUrl: './janela.html',
  styleUrl: './janela.css',
  host: {
    role: 'region',
    '[attr.aria-label]': 'titulo()',
    '[style.transform]': 'transformacao()',
    '[style.z-index]': 'camada() || null',
    // hidden (e nao display: none) guarda o espaco e ja tira a janela do foco e do leitor de tela
    '[style.visibility]': "minimizada() ? 'hidden' : null",
    '[class.arrastando]': 'arraste() !== null',
    class:
      'relative flex flex-col border-2 border-solid border-borda-padrao bg-fundo-superficie sombra-janela',
    '(pointerdown)': 'trazerParaFrente()',
  },
})
export class Janela {
  private readonly gerenciador = inject(GerenciadorDeJanelas);
  private readonly elemento = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly id = this.gerenciador.novoId();

  readonly titulo = input.required<string>();
  readonly icone = input<NomeIcone>();
  readonly controles = input<ControlesJanela>('todos');
  /** Espacamento do corpo (classes Tailwind). O padrao segue as janelas de formulario. */
  readonly corpo = input('p-e6 gap-e4');

  readonly minimizar = output<void>();
  readonly maximizar = output<void>();
  readonly fechar = output<void>();

  protected readonly minimizada = signal(false);
  protected readonly camada = signal(0);
  private readonly deslocamento = signal({ x: 0, y: 0 });
  protected readonly arraste = signal<Arraste | null>(null);

  protected readonly transformacao = computed(() => {
    const { x, y } = this.deslocamento();
    return x || y ? `translate(${x}px, ${y}px)` : null;
  });

  constructor() {
    // a tela da janela fechou (navegacao): tira o botao da barra de tarefas
    inject(DestroyRef).onDestroy(() => this.gerenciador.remover(this.id));
  }

  protected trazerParaFrente(): void {
    this.camada.set(this.gerenciador.trazerParaFrente());
  }

  protected aoMinimizar(): void {
    this.minimizada.set(true);
    this.gerenciador.minimizar({
      id: this.id,
      titulo: this.titulo,
      icone: this.icone,
      restaurar: () => this.restaurar(),
    });
    this.minimizar.emit();
  }

  private restaurar(): void {
    this.minimizada.set(false);
    this.gerenciador.remover(this.id);
    this.trazerParaFrente();
  }

  protected iniciarArraste(evento: PointerEvent): void {
    // so o botao principal, e nunca a partir dos botoes de controle
    if (evento.button !== 0) return;
    if ((evento.target as HTMLElement).closest('button')) return;

    evento.preventDefault();
    (evento.currentTarget as HTMLElement).setPointerCapture(evento.pointerId);
    const { x, y } = this.deslocamento();
    this.arraste.set({
      ponteiroX: evento.clientX,
      ponteiroY: evento.clientY,
      inicioX: x,
      inicioY: y,
      retangulo: this.elemento.nativeElement.getBoundingClientRect(),
    });
  }

  protected arrastar(evento: PointerEvent): void {
    const arraste = this.arraste();
    if (!arraste) return;

    const { retangulo } = arraste;
    // mantem a barra de titulo alcancavel: um pedaco sempre visivel na horizontal,
    // sem passar do topo nem descer para baixo da barra de tarefas
    const dx = limitar(
      evento.clientX - arraste.ponteiroX,
      MARGEM_VISIVEL - retangulo.right,
      window.innerWidth - MARGEM_VISIVEL - retangulo.left,
    );
    const dy = limitar(
      evento.clientY - arraste.ponteiroY,
      -retangulo.top,
      window.innerHeight -
        ALTURA_BARRA_DE_TAREFAS -
        MARGEM_VISIVEL / 2 -
        retangulo.top,
    );
    this.deslocamento.set({ x: arraste.inicioX + dx, y: arraste.inicioY + dy });
  }

  protected soltar(evento: PointerEvent): void {
    if (!this.arraste()) return;
    (evento.currentTarget as HTMLElement).releasePointerCapture(
      evento.pointerId,
    );
    this.arraste.set(null);
  }
}

function limitar(valor: number, minimo: number, maximo: number): number {
  return Math.min(Math.max(valor, minimo), maximo);
}
