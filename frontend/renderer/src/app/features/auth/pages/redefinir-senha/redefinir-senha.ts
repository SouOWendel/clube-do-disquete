import { Component, inject, input, signal } from '@angular/core';
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
import { Janela } from '../../../../shared/ui/janela/janela';
import { Link } from '../../../../shared/ui/link/link';
import { AuthApi } from '../../data-access/auth.api';
import { TelaAuth } from '../../ui/tela-auth/tela-auth';

type CampoRedefinicao = 'nova_senha' | 'confirmacao_senha';

/** Mesmas regras do RedefinirSenhaSerializer (backend/usuarios/serializers.py). */
const MENSAGENS: Record<CampoRedefinicao, Record<string, string>> = {
  nova_senha: {
    required: 'Crie uma nova senha.',
    minlength: 'A senha precisa de no mínimo 8 caracteres.',
  },
  confirmacao_senha: {
    required: 'Repita a nova senha.',
    diferente: 'As senhas não são iguais.',
  },
};

function senhasIguais(grupo: AbstractControl): ValidationErrors | null {
  const confirmacao = grupo.get('confirmacao_senha');
  if (
    !confirmacao?.value ||
    grupo.get('nova_senha')?.value === confirmacao.value
  )
    return null;
  return { diferente: true };
}

/**
 * Tela "REDEFINIR SENHA", aberta pelo link do e-mail de recuperacao
 * (`#/redefinir-senha?token=...`). O token chega pela query string.
 */
@Component({
  selector: 'app-redefinir-senha',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    Aviso,
    Botao,
    Campo,
    Janela,
    Link,
    TelaAuth,
  ],
  templateUrl: './redefinir-senha.html',
  host: { class: 'flex flex-1 flex-col' },
})
export class RedefinirSenha {
  private readonly auth = inject(AuthApi);
  protected readonly router = inject(Router);

  /** Preenchido pelo `withComponentInputBinding` a partir de `?token=`. */
  readonly token = input<string>();

  protected readonly form = inject(NonNullableFormBuilder).group(
    {
      nova_senha: ['', [Validators.required, Validators.minLength(8)]],
      confirmacao_senha: ['', Validators.required],
    },
    { validators: senhasIguais },
  );

  protected readonly enviando = signal(false);
  protected readonly enviado = signal(false);
  protected readonly concluido = signal(false);
  protected readonly erroGeral = signal<string | null>(null);
  protected readonly errosServidor = signal<ErrosDeCampo>({});

  protected erro(campo: CampoRedefinicao): string | null {
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

  protected redefinir(): void {
    this.enviado.set(true);
    this.erroGeral.set(null);
    this.errosServidor.set({});
    const token = this.token();
    if (!token || this.form.invalid || this.enviando()) return;

    this.enviando.set(true);
    this.auth.redefinirSenha({ token, ...this.form.getRawValue() }).subscribe({
      next: () => {
        this.enviando.set(false);
        this.concluido.set(true);
      },
      error: (erro: unknown) => {
        this.enviando.set(false);
        const erros = errosDeCampo(erro);
        this.errosServidor.set(erros);
        // erro no token (expirado/invalido) vem como campo `token` ou em `detail`
        this.erroGeral.set(erros['token'] ?? mensagemGeral(erro));
      },
    });
  }
}
