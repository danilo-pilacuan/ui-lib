import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  input,
  TemplateRef,
  ViewEncapsulation,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TableModule } from 'primeng/table';

/** Columna declarativa de ph-data-table. cell va en una ng-template. */
@Directive({ selector: 'ph-data-table-column' })
export class DataTableColumn {
  readonly name = input.required<string>();
  readonly header = input.required<string>();
  readonly align = input<'left' | 'right'>('left');
  readonly width = input<string | undefined>(undefined);
  readonly cell = contentChild(TemplateRef);
}

export interface DataTableFila {
  [clave: string]: unknown;
}

/*
 * Tabla generica declarativa (9.2) construida sobre p-table (DEC-004, 12.3):
 * columnas con ph-data-table-column y ng-template #cell; cubre cargando /
 * vacio (DoD de vistas). p-table va unstyled: el aspecto lo dan las clases
 * ph-table* con tokens de diseno. Sin loading: el estado de carga se
 * resuelve en el mensaje de vacio para no duplicar filas (TableBody pinta
 * loadingBodyTemplate ademas de las filas).
 */
@Component({
  selector: 'ph-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  // None: el <table>/<th>/<td> interno lo pinta p-table (sin _ngcontent);
  // los selectores van scopeados bajo .ph-table-wrap para no filtrar global.
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="ph-table-wrap">
      <p-table
        [value]="filasMutables()"
        [rowTrackBy]="filaTrackBy"
        [tableStyleClass]="'ph-table'"
        [unstyled]="true"
      >
        <ng-template #header let-columns>
          <tr>
            @for (col of columnas(); track col.name()) {
              <th
                [style.width]="col.width() ?? null"
                [class.ph-th-right]="col.align() === 'right'"
              >
                {{ col.header() }}
              </th>
            }
          </tr>
        </ng-template>
        <ng-template #body let-fila>
          <tr>
            @for (col of columnas(); track col.name()) {
              <td [class.ph-td-right]="col.align() === 'right'">
                @if (col.cell(); as tpl) {
                  <ng-container
                    [ngTemplateOutlet]="tpl"
                    [ngTemplateOutletContext]="{ $implicit: fila }"
                  />
                } @else {
                  {{ mostrar(fila, col.name()) }}
                }
              </td>
            }
          </tr>
        </ng-template>
        <ng-template #emptymessage>
          <tr>
            <td class="ph-table-empty" [attr.colspan]="columnas().length">
              @if (cargando()) {
                Cargando...
              } @else {
                {{ textoVacio() }}
              }
            </td>
          </tr>
        </ng-template>
      </p-table>
    </div>
  `,
  styles: [
    `
      .ph-table-wrap {
        overflow-x: auto;
        border: 1px solid var(--ph-color-border, #d9d9d9);
        border-radius: var(--ph-radius, 6px);
        background: var(--ph-color-surface, #fff);
      }
      .ph-table-wrap .ph-table {
        width: 100%;
        border-collapse: collapse;
        font-size: var(--ph-font-size-md, 0.9375rem);
      }
      .ph-table-wrap th {
        text-align: left;
        padding: 0.55rem 0.75rem;
        background: var(--ph-color-neutral-soft, #f1f3f5);
        border-bottom: 1px solid var(--ph-color-border, #d9d9d9);
        font-weight: 600;
        white-space: nowrap;
      }
      .ph-table-wrap td {
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid var(--ph-color-border, #d9d9d9);
        vertical-align: middle;
      }
      .ph-table-wrap tbody tr:last-child td {
        border-bottom: none;
      }
      .ph-th-right,
      .ph-td-right {
        text-align: right;
      }
      .ph-table-empty {
        text-align: center;
        color: var(--ph-color-text-soft, #666);
        padding: 1.5rem 0.75rem;
      }
    `,
  ],
  imports: [NgTemplateOutlet, TableModule],
})
export class DataTable {
  readonly filas = input.required<readonly DataTableFila[]>();
  readonly cargando = input(false);
  readonly textoVacio = input('Sin registros');
  readonly trackBy = input<((indice: number, fila: DataTableFila) => unknown) | undefined>(
    undefined,
  );

  protected readonly columnas = computed(() =>
    this._columnas().filter((c: DataTableColumn | undefined) => c !== undefined),
  );

  private readonly _columnas = contentChildren(DataTableColumn);

  // p-table exige (index, item) => unknown: cae al indice cuando el
  // consumidor no define trackBy, igual que el comportamiento previo.
  protected readonly filaTrackBy = (indice: number, fila: DataTableFila): unknown => {
    const fn = this.trackBy();
    return fn ? fn(indice, fila) : indice;
  };

  // El input value de p-table no acepta arreglos readonly: copia mutable.
  protected readonly filasMutables = computed<DataTableFila[]>(() => [...this.filas()]);

  protected mostrar(fila: DataTableFila, clave: string): string {
    const v = fila[clave];
    if (v === null || v === undefined) {
      return '-';
    }
    return String(v);
  }
}
