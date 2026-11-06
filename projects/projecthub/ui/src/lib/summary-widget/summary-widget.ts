import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SummaryTendencia = 'positiva' | 'negativa' | 'neutra';

/*
 * Tarjeta de resumen para dashboard y reportes (9.2). Es la base visual de
 * ProjectSummaryWidget (8.5) y de los KPI de mfe-reports (7.x).
 */
@Component({
  selector: 'ph-summary-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ph-summary" [class]="claseTendencia()">
      <span class="ph-summary-titulo">{{ titulo() }}</span>
      <span class="ph-summary-valor">{{ valor() }}</span>
      @if (detalle(); as d) {
        <span class="ph-summary-detalle">{{ d }}</span>
      }
    </div>
  `,
  styles: [
    `
      .ph-summary {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.85rem 1rem;
        border: 1px solid var(--ph-color-border, #d9d9d9);
        border-radius: var(--ph-radius, 6px);
        background: var(--ph-color-surface, #fff);
        border-left: 4px solid var(--ph-color-border, #d9d9d9);
      }
      .ph-summary-titulo {
        font-size: var(--ph-font-size-sm, 0.8125rem);
        font-weight: 600;
        color: var(--ph-color-text-soft, #666);
        text-transform: uppercase;
        letter-spacing: 0.03em;
      }
      .ph-summary-valor {
        font-size: 1.5rem;
        font-weight: 700;
        color: var(--ph-color-text, #222);
      }
      .ph-summary-detalle {
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-text-soft, #666);
      }
      .ph-summary--positiva {
        border-left-color: var(--ph-color-ok, #2e7d32);
      }
      .ph-summary--negativa {
        border-left-color: var(--ph-color-danger, #c62828);
      }
      .ph-summary--neutra {
        border-left-color: var(--ph-color-primary, #1976d2);
      }
    `,
  ],
})
export class SummaryWidget {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly detalle = input<string | null>(null);
  readonly tendencia = input<SummaryTendencia>('neutra');

  protected readonly claseTendencia = computed(() => `ph-summary--${this.tendencia()}`);
}
