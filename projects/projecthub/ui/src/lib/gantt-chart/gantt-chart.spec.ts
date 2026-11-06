import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { GanttChart } from './gantt-chart';
import type { EtapaTrabajo } from '@projecthub/shared';

function etapa(parcial: Partial<EtapaTrabajo>): EtapaTrabajo {
  return {
    id: 'e1',
    proyectoId: 'p1',
    nombre: 'Etapa 1',
    responsableId: 'u-pm',
    fechaInicio: '2025-01-01',
    fechaFin: '2025-01-31',
    presupuestoAsignado: 1000,
    presupuestoConsumido: 0,
    avance: 0,
    ...parcial,
  } as EtapaTrabajo;
}

describe('GanttChart', () => {
  async function render(etapas: EtapaTrabajo[]) {
    await TestBed.configureTestingModule({
      imports: [GanttChart],
    }).compileComponents();
    const fixture = TestBed.createComponent(GanttChart);
    fixture.componentRef.setInput('etapas', etapas);
    await fixture.whenStable();
    return fixture;
  }

  it('muestra mensaje vacio sin etapas', async () => {
    const fixture = await render([]);
    const vacio = fixture.debugElement.query(By.css('.ph-gantt-vacio'));
    expect(vacio).toBeTruthy();
    expect(vacio.nativeElement.textContent).toContain('Sin etapas');
  });

  it('renderiza una fila por etapa con su avance', async () => {
    const fixture = await render([
      etapa({ id: 'e1', nombre: 'Analisis', avance: 50 }),
      etapa({ id: 'e2', nombre: 'Desarrollo', fechaInicio: '2025-02-01', fechaFin: '2025-03-15', avance: 20 }),
    ]);
    const filas = fixture.debugElement.queryAll(By.css('.ph-gantt-fila'));
    expect(filas.length).toBe(2);
    const nombres = fixture.debugElement.queryAll(By.css('.ph-gantt-nombre'));
    expect(nombres.map((n) => n.nativeElement.textContent.trim())).toEqual([
      'Analisis',
      'Desarrollo',
    ]);
    const avances = fixture.debugElement.queryAll(By.css('.ph-gantt-avance'));
    expect(avances[0].styles['width']).toBe('50%');
    expect(avances[1].styles['width']).toBe('20%');
  });

  it('dibuja marcas de eje temporal', async () => {
    const fixture = await render([etapa({})]);
    const marcas = fixture.debugElement.queryAll(By.css('.ph-gantt-marca'));
    expect(marcas.length).toBeGreaterThan(0);
  });

  it('dibuja flecha de dependencia en la fila del dependiente', async () => {
    const fixture = await render([
      etapa({ id: 'e1', avance: 100, fechaFin: '2025-01-31' }),
      etapa({ id: 'e2', dependencias: ['e1'], fechaInicio: '2025-02-01', fechaFin: '2025-03-15' }),
    ]);
    const svgs = fixture.debugElement.queryAll(By.css('.ph-gantt-fila .ph-gantt-flechas'));
    expect(svgs.length).toBe(1);
    const polilines = svgs[0].queryAll(By.css('polyline'));
    expect(polilines.length).toBe(1);
    const puntos = polilines[0].attributes['points'];
    expect(puntos).toContain('41.0958904109589,0 41.0958904109589,1');
    expect(puntos).toContain('41.0958904109589,1 42.465753424657535,1');
    expect(puntos).toContain('42.465753424657535,1 40.965753424657535,0.7');
  });

  it('marca bloqueada la flecha cuando el prerequisito no esta al 100', async () => {
    const fixture = await render([
      etapa({ id: 'e1', avance: 40 }),
      etapa({ id: 'e2', dependencias: ['e1'], fechaInicio: '2025-02-01', fechaFin: '2025-03-15' }),
    ]);
    const polilines = fixture.debugElement.queryAll(By.css('.ph-gantt-flecha--bloqueada'));
    expect(polilines.length).toBe(1);
  });

  it('dibuja stub vertical en las filas intermedias cuando la dependencia cruza filas', async () => {
    const fixture = await render([
      etapa({ id: 'e1', avance: 100, fechaFin: '2025-01-31' }),
      etapa({ id: 'e2', fechaInicio: '2025-02-01', fechaFin: '2025-03-15' }),
      etapa({
        id: 'e3',
        dependencias: ['e1'],
        fechaInicio: '2025-06-01',
        fechaFin: '2025-07-15',
      }),
    ]);
    // Fila e2 (intermedia) lleva el stub vertical; fila e3 el tramo horizontal.
    const filas = fixture.debugElement.queryAll(By.css('.ph-gantt-fila'));
    const stubEnFilaIntermedia = filas[1].queryAll(By.css('polyline'));
    const horizontalEnFilaDestino = filas[2].queryAll(By.css('polyline'));
    expect(stubEnFilaIntermedia.length).toBe(1);
    expect(horizontalEnFilaDestino.length).toBe(1);
  });
});
