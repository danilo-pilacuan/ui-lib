import { ChangeDetectionStrategy, Component, Injectable, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

/** Tipos de campo soportados por el dialogo compartido (1.6 del alcance). */
export type CampoDialogoTipo = 'text' | 'number' | 'date' | 'textarea';

/** Campo de entrada dentro del dialogo: nombre es la clave del resultado. */
export interface CampoDialogo {
  nombre: string;
  etiqueta: string;
  tipo: CampoDialogoTipo;
  valor?: string;
  requerido?: boolean;
  min?: number;
  max?: number;
  textoAyuda?: string;
}

/** Configuracion del dialogo: sin campos es una confirmacion; con campos, un prompt. */
export interface DialogoConfig {
  titulo: string;
  mensaje?: string | null;
  campos?: CampoDialogo[];
  textoConfirmar?: string;
  textoCancelar?: string;
  /** Confirmacion destructiva: enfoca el dialogo y pinta el boton en rojo. */
  peligro?: boolean;
}

/** null = accion cancelada; objeto con los valores de los campos = confirmada. */
export type DialogoResultado = Record<string, string> | null;

/*
 * Dialogo generico de confirmacion/prompt (DEC-005, Material 22).
 * Reemplaza window.prompt/window.confirm en las apps: devuelve DialogoResultado
 * por afterClosed en lugar de valores sincronos. Textos en espanol.
 */
@Component({
  selector: 'ph-prompt-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule],
  template: `
    <h2 mat-dialog-title>{{ data.titulo }}</h2>
    <mat-dialog-content class="ph-dialog-contenido">
      @if (data.mensaje) {
        <p class="ph-dialog-mensaje">{{ data.mensaje }}</p>
      }
      @for (campo of data.campos ?? []; track campo.nombre) {
        <label class="ph-dialog-campo">
          <span class="ph-dialog-etiqueta">
            {{ campo.etiqueta }}@if (campo.requerido) {<span class="ph-dialog-req" aria-hidden="true"> *</span>}
          </span>
          @switch (campo.tipo) {
            @case ('textarea') {
              <textarea
                class="ph-dialog-input"
                rows="3"
                [value]="valor(campo.nombre)"
                (input)="cambiar(campo, $event)"
              ></textarea>
            }
            @default {
              <input
                class="ph-dialog-input"
                [type]="campo.tipo"
                [value]="valor(campo.nombre)"
                (input)="cambiar(campo, $event)"
                (keyup.enter)="confirmar()"
              />
            }
          }
          @if (campo.textoAyuda) {
            <span class="ph-dialog-ayuda">{{ campo.textoAyuda }}</span>
          }
        </label>
      }
      @if (errorValidacion(); as err) {
        <p class="ph-dialog-error" role="alert">{{ err }}</p>
      }
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button type="button" [mat-dialog-close]="null">{{ textoCancelar() }}</button>
      <button
        mat-flat-button
        type="button"
        class="ph-btn-confirmar"
        [class.ph-btn-peligro]="data.peligro"
        [disabled]="!puedeConfirmar()"
        (click)="confirmar()"
      >
        {{ textoConfirmar() }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .ph-dialog-contenido {
        display: block;
        min-width: 18rem;
        font-family: var(--ph-font-body, Roboto, sans-serif);
        font-size: var(--ph-font-size-md, 0.9375rem);
        color: var(--ph-color-text, #222222);
      }
      .ph-dialog-mensaje {
        margin: 0 0 0.75rem;
      }
      .ph-dialog-campo {
        display: flex;
        flex-direction: column;
        gap: 0.3rem;
        margin-bottom: 0.75rem;
      }
      .ph-dialog-etiqueta {
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-text-soft, #666666);
      }
      .ph-dialog-req {
        color: var(--ph-color-danger, #c62828);
      }
      .ph-dialog-input {
        padding: 0.45rem 0.6rem;
        border: 1px solid var(--ph-color-border, #d9d9d9);
        border-radius: var(--ph-radius, 6px);
        font: inherit;
        color: inherit;
        background: var(--ph-color-surface, #ffffff);
      }
      .ph-dialog-input:focus {
        outline: 2px solid var(--ph-color-primary, #1976d2);
        outline-offset: -1px;
      }
      .ph-dialog-ayuda {
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-text-soft, #666666);
      }
      .ph-dialog-error {
        margin: 0;
        color: var(--ph-color-danger, #c62828);
        font-size: var(--ph-font-size-sm, 0.8125rem);
      }
      .ph-btn-confirmar {
        --mat-button-filled-container-color: var(--ph-color-primary, #1976d2);
        --mat-button-filled-label-text-color: #ffffff;
      }
      .ph-btn-peligro {
        --mat-button-filled-container-color: var(--ph-color-danger, #c62828);
      }
    `,
  ],
})
export class PromptDialog {
  protected readonly data = inject<DialogoConfig>(MAT_DIALOG_DATA);
  private readonly ref = inject<MatDialogRef<PromptDialog, DialogoResultado>>(MatDialogRef);

  private readonly valores = signal<Record<string, string>>(this.valoresIniciales());
  private readonly intentoConfirmar = signal(false);

  protected readonly textoConfirmar = computed(() => this.data.textoConfirmar ?? 'Confirmar');
  protected readonly textoCancelar = computed(() => this.data.textoCancelar ?? 'Cancelar');

  /** Error de rango tras un intento de confirmacion; null mientras no se intente. */
  protected readonly errorValidacion = computed(() => (this.intentoConfirmar() ? this.validarRangos() : null));

  protected valor(nombre: string): string {
    return this.valores()[nombre] ?? '';
  }

  protected puedeConfirmar(): boolean {
    for (const campo of this.data.campos ?? []) {
      if (campo.requerido && !(this.valores()[campo.nombre] ?? '').trim()) {
        return false;
      }
    }
    return true;
  }

  protected cambiar(campo: CampoDialogo, evento: Event): void {
    const objetivo = evento.target as HTMLInputElement | HTMLTextAreaElement;
    const valor = objetivo.value;
    this.valores.update((prev) => ({ ...prev, [campo.nombre]: valor }));
  }

  protected confirmar(): void {
    if (!this.puedeConfirmar()) {
      this.intentoConfirmar.set(true);
      return;
    }
    const resultado: Record<string, string> = {};
    for (const campo of this.data.campos ?? []) {
      const valor = (this.valores()[campo.nombre] ?? '').trim();
      if (campo.tipo === 'number' && valor !== '') {
        const numero = Number(valor);
        if (
          Number.isNaN(numero) ||
          (campo.min != null && numero < campo.min) ||
          (campo.max != null && numero > campo.max)
        ) {
          this.intentoConfirmar.set(true);
          return;
        }
      }
      resultado[campo.nombre] = valor;
    }
    this.ref.close(resultado);
  }

  private valoresIniciales(): Record<string, string> {
    const valores: Record<string, string> = {};
    for (const campo of this.data.campos ?? []) {
      valores[campo.nombre] = campo.valor ?? '';
    }
    return valores;
  }

  private validarRangos(): string | null {
    for (const campo of this.data.campos ?? []) {
      if (campo.tipo !== 'number') {
        continue;
      }
      const valor = (this.valores()[campo.nombre] ?? '').trim();
      if (valor === '') {
        continue;
      }
      const numero = Number(valor);
      if (Number.isNaN(numero)) {
        return `${campo.etiqueta}: valor invalido`;
      }
      if (campo.min != null && numero < campo.min) {
        return `${campo.etiqueta}: valor menor que ${campo.min}`;
      }
      if (campo.max != null && numero > campo.max) {
        return `${campo.etiqueta}: valor mayor que ${campo.max}`;
      }
    }
    return null;
  }
}

/*
 * Servicio de conveniencia para abrir el dialogo compartido con valores por
 * defecto coherentes (ancho, foco, restoreFocus). Devuelve el MatDialogRef;
 * usar afterClosed() para obtener DialogoResultado (null si se cancela).
 */
@Injectable({ providedIn: 'root' })
export class PromptDialogService {
  private readonly dialog = inject(MatDialog);

  abrir(config: DialogoConfig): MatDialogRef<PromptDialog, DialogoResultado> {
    return this.dialog.open(PromptDialog, {
      data: config,
      width: '26rem',
      maxWidth: '90vw',
      autoFocus: config.peligro ? 'dialog' : 'firstTabbable',
      restoreFocus: true,
    });
  }

  confirmar(opciones: {
    titulo: string;
    mensaje?: string | null;
    textoConfirmar?: string;
    textoCancelar?: string;
    peligro?: boolean;
  }) {
    return this.abrir({ ...opciones, campos: [] });
  }

  pedirCampos(
    titulo: string,
    campos: CampoDialogo[],
    opciones: { mensaje?: string | null; peligro?: boolean } = {},
  ) {
    return this.abrir({ titulo, campos, mensaje: opciones.mensaje, peligro: opciones.peligro });
  }

  pedirDato(titulo: string, campo: CampoDialogo, opciones: { mensaje?: string | null } = {}) {
    return this.pedirCampos(titulo, [campo], opciones);
  }
}
