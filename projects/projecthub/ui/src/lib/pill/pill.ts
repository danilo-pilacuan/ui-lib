import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PillTono = 'ok' | 'info' | 'warn' | 'danger' | 'neutral' | 'primario';

/**
 * Etiqueta pill reutilizable (estado de gate, estado de entregable, tipo de
 * registro de bitacora). Unifica los estilos .pill que antes se repetian en
 * cada pagina; el tono es un input y el texto es un input requerido.
 */
@Component({
  selector: 'ph-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ph-pill" [class]="tono()">{{ contenido() }}</span>`,
  styles: [
    `
      .ph-pill {
        display: inline-block;
        padding: 0.05rem 0.5rem;
        border-radius: 999px;
        font-size: 0.6875rem;
        font-weight: 600;
        text-transform: uppercase;
        white-space: nowrap;
      }
      .ph-pill.ok {
        background: var(--ph-color-ok-soft, #e6f2e7);
        color: var(--ph-color-ok, #2e7d32);
      }
      .ph-pill.info {
        background: var(--ph-color-primary-soft, #e3f0fb);
        color: var(--ph-color-primary, #1976d2);
      }
      .ph-pill.warn {
        background: var(--ph-color-warn-soft, #fdf0dd);
        color: var(--ph-color-warn, #b26a00);
      }
      .ph-pill.danger {
        background: var(--ph-color-danger-soft, #fbe4e4);
        color: var(--ph-color-danger, #c62828);
      }
      .ph-pill.neutral {
        background: var(--ph-color-neutral-soft, #f1f3f5);
        color: var(--ph-color-text-soft, #666);
      }
      .ph-pill.primario {
        background: var(--ph-color-primary, #1976d2);
        color: #fff;
      }
    `,
  ],
})
export class Pill {
  /** Tono de color de la pill; por defecto neutral. */
  readonly tono = input<PillTono>('neutral');

  /** Texto de la etiqueta. */
  readonly contenido = input.required<string>();
}
