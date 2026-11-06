import {
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  contentChildren,
  Directive,
  input,
  TemplateRef,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { NgTemplateOutlet } from '@angular/common';

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
 * Tabla generica declarativa (9.2) construida sobre mat-table (12.3, DEC-005).
 * Columnas con ph-data-table-column y ng-template #cell; cubre cargando /
 * vacio (DoD de vistas). La API publica (inputs y selectores) no cambia.
 */
@Component({
  selector: 'ph-data-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="ph-table-wrap">
      <table mat-table [dataSource]="filas()" class="ph-table">
        @for (col of columnas(); track col.name()) {
          <ng-container [matColumnDef]="col.name()">
            <th
              mat-header-cell
              *matHeaderCellDef
              [style.width]="col.width() ?? null"
              [class.ph-th-right]="col.align() === 'right'"
            >
              {{ col.header() }}
            </th>
            <td
              mat-cell
              *matCellDef="let fila"
              [class.ph-td-right]="col.align() === 'right'"
            >
              @if (col.cell(); as tpl) {
                <ng-container
                  [ngTemplateOutlet]="tpl"
                  [ngTemplateOutletContext]="{ $implicit: fila }"
                />
              } @else {
                {{ mostrar(fila, col.name()) }}
              }
            </td>
          </ng-container>
        }

        <tr mat-header-row *matHeaderRowDef="columnasVisibles()"></tr>
        <tr mat-row *matRowDef="let fila; columns: columnasVisibles()"></tr>

        <tr *matNoDataRow>
          <td class="ph-table-empty" [attr.colspan]="columnasVisibles().length">
            @if (cargando()) {
              Cargando...
            } @else {
              {{ textoVacio() }}
            }
          </td>
        </tr>
      </table>
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
      .ph-table {
        width: 100%;
      }
      th {
        text-align: left;
        padding: 0.55rem 0.75rem;
        background: var(--ph-color-neutral-soft, #f1f3f5);
        border-bottom: 1px solid var(--ph-color-border, #d9d9d9);
        font-weight: 600;
        white-space: nowrap;
        color: var(--ph-color-text, #222);
      }
      td {
        padding: 0.55rem 0.75rem;
        border-bottom: 1px solid var(--ph-color-border, #d9d9d9);
        vertical-align: middle;
        color: var(--ph-color-text, #222);
      }
      tbody tr:last-child td {
        border-bottom: none;
      }
      .ph-th-right,
      .ph-td-right {
        text-align: right;
      }
      .ph-table-empty-row td {
        border-bottom: none;
      }
      .ph-table-empty {
        text-align: center;
        color: var(--ph-color-text-soft, #666);
        padding: 1.5rem 0.75rem;
      }
    `,
  ],
  imports: [MatTableModule, NgTemplateOutlet],
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

  protected readonly columnasVisibles = computed(() => this.columnas().map((c) => c.name()));

  private readonly _columnas = contentChildren(DataTableColumn);

  protected filaTrackBy(indice: number, fila: DataTableFila): unknown {
    const fn = this.trackBy();
    return fn ? fn(indice, fila) : indice;
  }

  protected mostrar(fila: DataTableFila, clave: string): string {
    const v = fila[clave];
    if (v === null || v === undefined) {
      return '-';
    }
    return String(v);
  }
}
