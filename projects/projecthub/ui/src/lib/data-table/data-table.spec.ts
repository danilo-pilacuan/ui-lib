import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { DataTable, DataTableColumn } from './data-table';

interface Fila {
  [clave: string]: unknown;
  nombre: string;
  monto: number;
}

@Component({
  selector: 'app-test-host',
  imports: [DataTable, DataTableColumn],
  template: `
    <ph-data-table [filas]="filas" [cargando]="cargando" [textoVacio]="textoVacio" [pie]="pie">
      <ph-data-table-column name="nombre" header="Nombre"></ph-data-table-column>
      <ph-data-table-column name="monto" header="Monto" align="right"></ph-data-table-column>
    </ph-data-table>
  `,
})
class TestHost {
  filas: Fila[] = [];
  cargando = false;
  textoVacio = 'Sin registros';
  pie?: Fila;
}

describe('DataTable', () => {
  async function render(
    filas: Fila[],
    opciones: { cargando?: boolean; textoVacio?: string } = {},
    pie?: Fila,
  ): Promise<ComponentFixture<TestHost>> {
    await TestBed.configureTestingModule({
      imports: [TestHost],
    }).compileComponents();
    const fixture = TestBed.createComponent(TestHost);
    fixture.componentInstance.filas = filas;
    fixture.componentInstance.cargando = opciones.cargando ?? false;
    fixture.componentInstance.textoVacio = opciones.textoVacio ?? 'Sin registros';
    fixture.componentInstance.pie = pie;
    await fixture.whenStable();
    return fixture;
  }

  it('renderiza encabezados y filas', async () => {
    const fixture = await render([
      { nombre: 'Portal', monto: 1000 },
      { nombre: 'API', monto: 2000 },
    ]);
    const headers = fixture.debugElement.queryAll(By.css('th'));
    expect(headers.map((h) => h.nativeElement.textContent.trim())).toEqual([
      'Nombre',
      'Monto',
    ]);
    const filas = fixture.debugElement.queryAll(By.css('tbody tr'));
    expect(filas.length).toBe(2);
    const celdas = fixture.debugElement.queryAll(By.css('tbody tr:first-child td'));
    expect(celdas.map((c) => c.nativeElement.textContent.trim())).toEqual(['Portal', '1000']);
  });

  it('muestra estado de cargando cuando no hay filas', async () => {
    const fixture = await render([], { cargando: true });
    const vacio = fixture.debugElement.query(By.css('.ph-table-empty'));
    expect(vacio.nativeElement.textContent.trim()).toBe('Cargando...');
  });

  it('muestra texto vacio configurable', async () => {
    const fixture = await render([], { textoVacio: 'Sin proyectos' });
    const vacio = fixture.debugElement.query(By.css('.ph-table-empty'));
    expect(vacio.nativeElement.textContent.trim()).toBe('Sin proyectos');
  });

  it('renderiza fila de pie con valores y plantillas de columna', async () => {
    const fixture = await render(
      [{ nombre: 'Portal', monto: 1000 }],
      {},
      { nombre: 'Total', monto: 1000 },
    );
    const pie = fixture.debugElement.queryAll(By.css('tr.mat-mdc-footer-row td'));
    expect(pie.map((c) => c.nativeElement.textContent.trim())).toEqual(['Total', '1000']);
  });

  it('oculta el pie cuando no se pasa', async () => {
    const fixture = await render([{ nombre: 'Portal', monto: 1000 }]);
    expect(fixture.debugElement.query(By.css('tr.mat-mdc-footer-row'))).toBeNull();
  });
});
