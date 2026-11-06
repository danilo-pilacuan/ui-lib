import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MessageModule } from 'primeng/message';
import type { MessageSeverity } from 'primeng/types/message';

export type PermissionBannerVariante = 'info' | 'warn' | 'danger';

const SEVERIDADES: Record<PermissionBannerVariante, MessageSeverity> = {
  info: 'info',
  warn: 'warn',
  danger: 'error',
};

/*
 * Banner para vista sin permisos o accion no permitida (1.7 del alcance),
 * construido sobre p-message unstyled (DEC-004, 12.3): el rol de aviso lo da
 * PrimeNG (danger se mapea a error, MessageSeverity no tiene 'danger'); el
 * aspecto lo fijan las clases ph-banner--* con tokens de diseno.
 */
@Component({
  selector: 'ph-permission-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MessageModule],
  template: `
    <div class="ph-banner" [class]="clase()" role="status">
      <span class="ph-banner-icon" aria-hidden="true">
        @switch (variante()) {
          @case ('danger') {
            &#10005;
          }
          @case ('warn') {
            &#9888;
          }
          @default {
            &#9432;
          }
        }
      </span>
      <p-message [severity]="severidad()" [unstyled]="true">
        <span class="ph-banner-texto">
          <strong>{{ titulo() }}</strong>
          @if (detalle(); as d) {
            <span class="ph-banner-detalle">{{ d }}</span>
          }
        </span>
      </p-message>
    </div>
  `,
  styles: [
    `
      .ph-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.7rem 0.9rem;
        border-radius: var(--ph-radius, 6px);
        border: 1px solid var(--ph-color-border, #d9d9d9);
        font-size: var(--ph-font-size-md, 0.9375rem);
      }
      .ph-banner--info {
        background: var(--ph-color-primary-soft, #e3f0fb);
        border-color: var(--ph-color-primary, #1976d2);
        color: var(--ph-color-primary, #1976d2);
      }
      .ph-banner--warn {
        background: var(--ph-color-warn-soft, #fdf0dd);
        border-color: var(--ph-color-warn, #b26a00);
        color: var(--ph-color-warn, #b26a00);
      }
      .ph-banner--danger {
        background: var(--ph-color-danger-soft, #fbe4e4);
        border-color: var(--ph-color-danger, #c62828);
        color: var(--ph-color-danger, #c62828);
      }
      .ph-banner-icon {
        line-height: 1.4;
      }
      .ph-banner-texto {
        display: flex;
        flex-direction: column;
        gap: 0.15rem;
      }
      .ph-banner-detalle {
        color: var(--ph-color-text, #222);
        font-weight: 400;
      }
    `,
  ],
})
export class PermissionBanner {
  readonly titulo = input.required<string>();
  readonly detalle = input<string | null>(null);
  readonly variante = input<PermissionBannerVariante>('warn');

  protected readonly clase = computed(() => `ph-banner--${this.variante()}`);

  protected readonly severidad = computed(() => SEVERIDADES[this.variante()]);
}
