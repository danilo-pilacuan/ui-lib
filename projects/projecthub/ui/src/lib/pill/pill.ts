import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type PillTono = 'ok' | 'info' | 'warn' | 'danger' | 'neutral' | 'primario';

/**
 * Etiqueta pill reutilizable (estado de gate, estado de entregable, tipo de
 * registro de bitacora, metadata de proyecto). Unifica los estilos .pill/.chip
 * que antes se repetian en cada pagina; el tono es un input y el texto es un
 * input requerido.
 */
@Component({
  selector: 'ph-pill',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ph-pill" [class]="tono()" [title]="title()">{{ contenido() }}</span>`,
  styles: [
    `
      .ph-pill {
        display: inline-block;
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: 0.75rem;
        font-weight: 600;
        white-space: nowrap;
      }
      .ph-pill.neutral {
        background: var(--ph-color-neutral-soft, #f1f3f5);
        color: var(--ph-color-text-soft, #666);
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

  /** Texto emergente opcional (p. ej. el ID tecnico del patrocinador). */
  readonly title = input('');
}
