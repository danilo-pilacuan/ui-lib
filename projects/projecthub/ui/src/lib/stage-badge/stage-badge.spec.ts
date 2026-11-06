import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { StageBadge } from './stage-badge';

describe('StageBadge', () => {
  async function render(valor: string, kind: 'etapa' | 'estado' = 'etapa') {
    await TestBed.configureTestingModule({
      imports: [StageBadge],
    }).compileComponents();
    const fixture = TestBed.createComponent(StageBadge);
    fixture.componentRef.setInput('valor', valor);
    fixture.componentRef.setInput('kind', kind);
    await fixture.whenStable();
    return fixture;
  }

  it('muestra la etiqueta legible de una etapa', async () => {
    const fixture = await render('PoC');
    const el = fixture.debugElement.query(By.css('.ph-badge'));
    expect(el.nativeElement.textContent.trim()).toBe('Prueba de concepto');
  });

  it('muestra la etiqueta de un estado del proyecto', async () => {
    const fixture = await render('Cancelado', 'estado');
    const el = fixture.debugElement.query(By.css('.ph-badge'));
    expect(el.nativeElement.textContent.trim()).toBe('Cancelado');
    expect(el.nativeElement.className).toContain('ph-badge--danger');
  });

  it('aplica la clase de color por etapa', async () => {
    const fixture = await render('Ejecucion');
    const el = fixture.debugElement.query(By.css('.ph-badge'));
    expect(el.nativeElement.className).toContain('ph-badge--primary');
  });
});
