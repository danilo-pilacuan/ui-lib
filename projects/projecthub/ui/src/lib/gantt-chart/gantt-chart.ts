import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { EtapaTrabajo } from '@projecthub/shared';
import { IntlFormat } from '../intl-format';

export interface GanttBarra {
  etapa: EtapaTrabajo;
  inicio: Date;
  fin: Date;
  avance: number;
  /** Posicion del borde izquierdo de la barra, en % del eje. */
  inicioPct: number;
  /** Ancho de la barra, en % del eje. */
  anchoPct: number;
}

const DIA_MS = 24 * 60 * 60 * 1000;

/*
 * Gantt propio en SVG/CSS (6.1-6.4, sin librerias de terceros).
 * Eje temporal con marcas mensuales, barras proporcionales a las fechas y
 * relleno de avance ponderado por etapa de trabajo.
 */
@Component({
  selector: 'ph-gantt-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (barras().length === 0) {
      <p class="ph-gantt-vacio">Sin etapas de trabajo para mostrar.</p>
    } @else {
      <div class="ph-gantt" role="img" [attr.aria-label]="ariaLabel()">
        <div class="ph-gantt-eje">
          @for (marca of marcas(); track marca.etiqueta) {
            <span
              class="ph-gantt-marca"
              [style.left.%]="marca.posicion"
              [class.ph-gantt-marca--borde]="marca.posicion > 90"
            >
              {{ marca.etiqueta }}
            </span>
          }
        </div>
        <div class="ph-gantt-filas">
          @for (barra of barras(); track barra.etapa.id) {
            <div class="ph-gantt-fila">
              <span class="ph-gantt-nombre" [title]="barra.etapa.nombre">
                {{ barra.etapa.nombre }}
              </span>
              <div class="ph-gantt-pista">
                <div
                  class="ph-gantt-barra"
                  [style.left.%]="barra.inicioPct"
                  [style.width.%]="barra.anchoPct"
                  [title]="tooltip(barra)"
                >
                  <div class="ph-gantt-avance" [style.width.%]="barra.avance"></div>
                  <span class="ph-gantt-pct">{{ barra.avance }}%</span>
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    }
  `,
  styles: [
    `
      .ph-gantt {
        border: 1px solid var(--ph-color-border, #d9d9d9);
        border-radius: var(--ph-radius, 6px);
        background: var(--ph-color-surface, #fff);
        padding: 0.75rem 0.75rem 0.5rem;
        overflow-x: auto;
      }
      .ph-gantt-vacio {
        color: var(--ph-color-text-soft, #666);
        padding: 1rem 0.25rem;
      }
      .ph-gantt-eje {
        position: relative;
        height: 1.4rem;
        margin-left: 11rem;
        border-bottom: 1px solid var(--ph-color-border, #d9d9d9);
        min-width: 480px;
      }
      .ph-gantt-marca {
        position: absolute;
        transform: translateX(-50%);
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-text-soft, #666);
        white-space: nowrap;
      }
      .ph-gantt-marca--borde {
        transform: translateX(-100%);
      }
      .ph-gantt-filas {
        min-width: 480px;
      }
      .ph-gantt-fila {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.3rem 0;
      }
      .ph-gantt-nombre {
        flex: 0 0 10.5rem;
        font-size: var(--ph-font-size-md, 0.9375rem);
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .ph-gantt-pista {
        flex: 1;
        position: relative;
        height: 1.5rem;
        background: var(--ph-color-neutral-soft, #f1f3f5);
        border-radius: 4px;
      }
      .ph-gantt-barra {
        position: absolute;
        top: 0.15rem;
        bottom: 0.15rem;
        border-radius: 4px;
        background: var(--ph-color-primary-soft, #e3f0fb);
        border: 1px solid var(--ph-color-primary, #1976d2);
        overflow: hidden;
        min-width: 2px;
      }
      .ph-gantt-avance {
        position: absolute;
        inset: 0 auto 0 0;
        background: var(--ph-color-primary, #1976d2);
      }
      .ph-gantt-pct {
        position: absolute;
        right: 0.25rem;
        top: 50%;
        transform: translateY(-50%);
        font-size: 0.6875rem;
        font-weight: 600;
        color: var(--ph-color-text, #222);
        mix-blend-mode: multiply;
      }
    `,
  ],
})
export class GanttChart {
  private readonly intl = inject(IntlFormat);

  readonly etapas = input.required<readonly EtapaTrabajo[]>();

  protected readonly barras = computed<GanttBarra[]>(() => {
    const etapas = [...this.etapas()].filter((e) => e.fechaInicio && e.fechaFin);
    if (etapas.length === 0) {
      return [];
    }
    etapas.sort((a, b) => a.fechaInicio.localeCompare(b.fechaInicio));
    const min = etapas[0].fechaInicio;
    const max = etapas.reduce((m, e) => (e.fechaFin > m ? e.fechaFin : m), etapas[0].fechaFin);
    const total = Math.max(1, (new Date(max).getTime() - new Date(min).getTime()) / DIA_MS);
    return etapas.map((etapa) => {
      const inicioDias = (new Date(etapa.fechaInicio).getTime() - new Date(min).getTime()) / DIA_MS;
      const duracionDias =
        Math.max(1, (new Date(etapa.fechaFin).getTime() - new Date(etapa.fechaInicio).getTime()) / DIA_MS);
      return {
        etapa,
        inicio: new Date(etapa.fechaInicio),
        fin: new Date(etapa.fechaFin),
        avance: Math.min(100, Math.max(0, Math.round(etapa.avance))),
        inicioPct: (inicioDias / total) * 100,
        anchoPct: Math.max(1, (duracionDias / total) * 100),
      };
    });
  });

  protected readonly marcas = computed(() => {
    const barras = this.barras();
    if (barras.length === 0) {
      return [];
    }
    const min = barras[0].inicio;
    const max = barras.reduce((m, b) => (b.fin > m ? b.fin : m), barras[0].fin);
    const totalMs = Math.max(1, max.getTime() - min.getTime());
    const marcas: { etiqueta: string; posicion: number }[] = [];
    const cursor = new Date(min.getFullYear(), min.getMonth(), 1);
    while (cursor <= max) {
      if (cursor >= min) {
        marcas.push({
          etiqueta: new Intl.DateTimeFormat('es-CO', { month: 'short', year: '2-digit' }).format(cursor),
          posicion: ((cursor.getTime() - min.getTime()) / totalMs) * 100,
        });
      }
      cursor.setMonth(cursor.getMonth() + 1);
    }
    return marcas;
  });

  protected readonly ariaLabel = computed(
    () => `Diagrama Gantt con ${this.barras().length} etapa(s) de trabajo`,
  );

  protected tooltip(barra: GanttBarra): string {
    return `${barra.etapa.nombre}: ${this.intl.fecha(barra.inicio)} - ${this.intl.fecha(barra.fin)} | Avance ${barra.avance}%`;
  }
}
