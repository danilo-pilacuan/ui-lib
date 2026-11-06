import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { EstadoProyecto, EtapaCicloVida } from '@projecthub/shared';

export type StageBadgeKind = 'etapa' | 'estado';

const CLASES_ETAPA: Record<EtapaCicloVida, string> = {
  Planteamiento: 'ph-badge--soft',
  Iniciativa: 'ph-badge--info',
  PoC: 'ph-badge--info',
  ValidacionPoC: 'ph-badge--info',
  Planeacion: 'ph-badge--info',
  Contratos: 'ph-badge--warn',
  Ejecucion: 'ph-badge--primary',
  Operacion: 'ph-badge--ok',
  Cierre: 'ph-badge--neutral',
};

const CLASES_ESTADO: Record<EstadoProyecto, string> = {
  Activo: 'ph-badge--ok',
  Cancelado: 'ph-badge--danger',
  Cerrado: 'ph-badge--neutral',
};

const ETIQUETAS_ETAPA: Record<EtapaCicloVida, string> = {
  Planteamiento: 'Planteamiento',
  Iniciativa: 'Iniciativa',
  PoC: 'Prueba de concepto',
  ValidacionPoC: 'Validacion de PoC',
  Planeacion: 'Planeacion',
  Contratos: 'Contratos',
  Ejecucion: 'Ejecucion',
  Operacion: 'Operacion',
  Cierre: 'Cierre',
};

const ETIQUETAS_ESTADO: Record<EstadoProyecto, string> = {
  Activo: 'Activo',
  Cancelado: 'Cancelado',
  Cerrado: 'Cerrado',
};

/*
 * Badge de etapa del ciclo de vida o de estado del proyecto (9.2).
 * Son conceptos distintos (AGENTS.md terminologia canonica): se elige con kind.
 */
@Component({
  selector: 'ph-stage-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="ph-badge" [class]="clase()">{{ etiqueta() }}</span>`,
  styles: [
    `
      .ph-badge {
        display: inline-block;
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: var(--ph-font-size-sm, 0.8125rem);
        font-weight: 600;
        white-space: nowrap;
      }
      .ph-badge--soft {
        background: var(--ph-color-neutral-soft, #f1f3f5);
        color: var(--ph-color-text, #222);
      }
      .ph-badge--info {
        background: var(--ph-color-primary-soft, #e3f0fb);
        color: var(--ph-color-primary, #1976d2);
      }
      .ph-badge--primary {
        background: var(--ph-color-primary, #1976d2);
        color: #fff;
      }
      .ph-badge--ok {
        background: var(--ph-color-ok-soft, #e6f2e7);
        color: var(--ph-color-ok, #2e7d32);
      }
      .ph-badge--warn {
        background: var(--ph-color-warn-soft, #fdf0dd);
        color: var(--ph-color-warn, #b26a00);
      }
      .ph-badge--danger {
        background: var(--ph-color-danger-soft, #fbe4e4);
        color: var(--ph-color-danger, #c62828);
      }
      .ph-badge--neutral {
        background: var(--ph-color-neutral-soft, #f1f3f5);
        color: var(--ph-color-text-soft, #666);
      }
    `,
  ],
})
export class StageBadge {
  readonly valor = input.required<EtapaCicloVida | EstadoProyecto>();
  readonly kind = input<StageBadgeKind>('etapa');

  protected readonly clase = computed(() => {
    if (this.kind() === 'estado') {
      return CLASES_ESTADO[this.valor() as EstadoProyecto] ?? 'ph-badge--soft';
    }
    return CLASES_ETAPA[this.valor() as EtapaCicloVida] ?? 'ph-badge--soft';
  });

  protected readonly etiqueta = computed(() => {
    if (this.kind() === 'estado') {
      return ETIQUETAS_ESTADO[this.valor() as EstadoProyecto] ?? String(this.valor());
    }
    return ETIQUETAS_ETAPA[this.valor() as EtapaCicloVida] ?? String(this.valor());
  });
}
