import { Component, inject, signal } from '@angular/core';
import {
  AbstractControl,
  NonNullableFormBuilder,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import {
  errosDeCampo,
  ErrosDeCampo,
  mensagemGeral,
} from '../../../../core/api/mensagem-de-erro';
import { Aviso } from '../../../../shared/ui/aviso/aviso';
import { Botao } from '../../../../shared/ui/botao/botao';
import { Campo } from '../../../../shared/ui/campo/campo';
import { Checkbox } from '../../../../shared/ui/checkbox/checkbox';
import { DivisorOu } from '../../../../shared/ui/divisor-ou/divisor-ou';
import { Janela } from '../../../../shared/ui/janela/janela';
import { Link } from '../../../../shared/ui/link/link';
import { AuthApi } from '../../data-access/auth.api';
import { BotaoGoogle } from '../../ui/botao-google/botao-google';
import { TelaAuth } from '../../ui/tela-auth/tela-auth';

type CampoCadastro =
  | 'email'
  | 'nome_usuario'
  | 'senha'
  | 'confirmacao_senha'
  | 'termos_aceitos';

/** Mesmas regras do CadastroSerializer (backend/usuarios/serializers.py). */
const MENSAGENS: Record<CampoCadastro, Record<string, string>> = {
  email: {
    required: 'Informe seu e-mail.',
    email: 'Informe um e-mail válido.',
  },
  nome_usuario: {
    required: 'Escolha um nome de usuário.',
    minlength: 'Use pelo menos 3 caracteres.',
    pattern: 'Use apenas letras, números, ponto, hífen ou sublinhado.',
  },
  senha: {
    required: 'Crie uma senha.',
    minlength: 'A senha precisa de no mínimo 8 caracteres.',
  },
  confirmacao_senha: {
    required: 'Repita a senha.',
    diferente: 'As senhas não são iguais.',
  },
  termos_aceitos: { required: 'É preciso aceitar os termos de uso.' },
};

function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  const confirmacao = grupo.get('confirmacao_senha');
  if (!confirmacao?.value || grupo.get('senha')?.value === confirmacao.value)
    return null;
  return { diferente: true };
}

/** Tela "+ CRIAR CONTA" (Figma > Home — revisao > Cadastro). */
@Component({
  selector: 'app-cadastro',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Aviso,
    Botao,
    BotaoGoogle,
    Campo,
    Checkbox,
    DivisorOu,
    Janela,
    Link,
    TelaAuth,
  ],
  templateUrl: './cadastro.html',
  host: { class: 'flex flex-1 flex-col' },
})
export class Cadastro {
  private readonly auth = inject(AuthApi);
  protected readonly router = inject(Router);

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      email: ['', [Validators.required, Validators.email]],
      nome_usuario: [
        '',
        [
          Validators.required,
          Validators.minLength(3),
          Validators.pattern(/^[a-zA-Z0-9_.-]+$/),
        ],
      ],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacao_senha: ['', Validators.required],
      termos_aceitos: [false, Validators.requiredTrue],
    },
    { validators: senhasIguais },
  );

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly erroGeral = signal<string | null>(null);
  protected readonly errosServidor = signal<ErrosDeCampo>({});

  protected erro(campo: CampoCadastro): string | null {
    const doServidor = this.errosServidor()[campo];
    if (doServidor) return doServidor;

    const controle = this.form.controls[campo];
    if (!(controle.touched || this.enviado())) return null;
    if (campo === 'confirmacao_senha' && this.form.hasError('diferente')) {
      return MENSAGENS.confirmacao_senha['diferente'];
    }
    const chave = Object.keys(controle.errors ?? {})[0];
    return chave
      ? (MENSAGENS[campo][chave] ?? MENSAGENS[campo]['required'])
      : null;
  }

  protected criarConta(): void {
    this.enviado.set(true);
    this.erroGeral.set(null);
    this.errosServidor.set({});
    if (this.form.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.auth.cadastrar(this.form.getRawValue()).subscribe({
      next: () => this.router.navigateByUrl('/'),
      error: (erro: unknown) => {
        this.enviando.set(false);
        this.errosServidor.set(errosDeCampo(erro));
        this.erroGeral.set(mensagemGeral(erro));
      },
    });
  }
}
