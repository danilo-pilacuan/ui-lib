import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

export type PermissionBannerVariante = 'info' | 'warn' | 'danger';

const ICONO: Record<PermissionBannerVariante, string> = {
  danger: 'error',
  warn: 'warning',
  info: 'info',
};

/*
 * Banner para vista sin permisos o accion no permitida (1.7 del alcance).
 * Base Material (DEC-005): mat-card outlined + mat-icon. Texto en espanol,
 * variante visual por severidad.
 */
@Component({
  selector: 'ph-permission-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatCardModule, MatIconModule],
  template: `
    <mat-card appearance="outlined" class="ph-banner" [class]="clase()" role="status">
      <mat-icon aria-hidden="true">{{ icono() }}</mat-icon>
      <span class="ph-banner-texto">
        <strong>{{ titulo() }}</strong>
        @if (detalle(); as d) {
          <span class="ph-banner-detalle">{{ d }}</span>
        }
      </span>
    </mat-card>
  `,
  styles: [
    `
      mat-card.ph-banner {
        display: flex;
        align-items: flex-start;
        gap: 0.6rem;
        padding: 0.7rem 0.9rem;
        font-size: var(--ph-font-size-md, 0.9375rem);
        font-family: var(--ph-font-body, Roboto, sans-serif);
      }
      .ph-banner--info {
        --mat-card-outlined-container-color: var(--ph-color-primary-soft, #e3f0fb);
        --mat-card-outlined-outline-color: var(--ph-color-primary, #1976d2);
        --mat-card-outlined-outline-width: 1px;
        color: var(--ph-color-primary, #1976d2);
      }
      .ph-banner--warn {
        --mat-card-outlined-container-color: var(--ph-color-warn-soft, #fdf0dd);
        --mat-card-outlined-outline-color: var(--ph-color-warn, #b26a00);
        --mat-card-outlined-outline-width: 1px;
        color: var(--ph-color-warn, #b26a00);
      }
      .ph-banner--danger {
        --mat-card-outlined-container-color: var(--ph-color-danger-soft, #fbe4e4);
        --mat-card-outlined-outline-color: var(--ph-color-danger, #c62828);
        --mat-card-outlined-outline-width: 1px;
        color: var(--ph-color-danger, #c62828);
      }
      mat-icon {
        font-size: 1.25rem;
        width: 1.25rem;
        height: 1.25rem;
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
  protected readonly icono = computed(() => ICONO[this.variante()] ?? 'info');
}
