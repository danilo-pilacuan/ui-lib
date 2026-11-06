import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatCardModule } from '@angular/material/card';

export type SummaryTendencia = 'positiva' | 'negativa' | 'neutra';

/*
 * Tarjeta de resumen para dashboard y reportes (9.2), sobre mat-card
 * (12.3, DEC-005). Es la base visual de ProjectSummaryWidget (8.5) y de los
 * KPI de mfe-reports (7.x). API publica (inputs) sin cambios.
 */
@Component({
  selector: 'ph-summary-widget',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <mat-card class="ph-summary" [class]="claseTendencia()" appearance="outlined">
      <mat-card-content class="ph-summary-body">
        <span class="ph-summary-titulo">{{ titulo() }}</span>
        <span class="ph-summary-valor">{{ valor() }}</span>
        @if (detalle(); as d) {
          <span class="ph-summary-detalle">{{ d }}</span>
        }
      </mat-card-content>
    </mat-card>
  `,
  styles: [
    `
      .ph-summary {
        border: 1px solid var(--ph-color-border, #d9d9d9);
        border-radius: var(--ph-radius, 6px);
        background: var(--ph-color-surface, #fff);
        border-left: 4px solid var(--ph-color-border, #d9d9d9);
        font-family: var(--ph-font-body, Roboto, sans-serif);
      }
      .ph-summary-body {
        display: flex;
        flex-direction: column;
        gap: 0.2rem;
        padding: 0.85rem 1rem;
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
  imports: [MatCardModule],
})
export class SummaryWidget {
  readonly titulo = input.required<string>();
  readonly valor = input.required<string>();
  readonly detalle = input<string | null>(null);
  readonly tendencia = input<SummaryTendencia>('neutra');

  protected readonly claseTendencia = computed(() => `ph-summary--${this.tendencia()}`);
}
