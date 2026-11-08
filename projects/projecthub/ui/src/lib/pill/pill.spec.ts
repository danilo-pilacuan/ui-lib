import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { Pill, PillTono } from './pill';

describe('Pill', () => {
  async function render(contenido: string, tono?: string) {
    await TestBed.configureTestingModule({
      imports: [Pill],
    }).compileComponents();
    const fixture = TestBed.createComponent(Pill);
    fixture.componentRef.setInput('contenido', contenido);
    if (tono !== undefined) {
      fixture.componentRef.setInput('tono', tono);
    }
    await fixture.whenStable();
    return fixture;
  }

  /** El TestBed ya esta instanciado tras el primer render; para los tonos
   * restantes se crea otra instancia del componente sobre el mismo modulo. */
  function renderSinModulo(tono: PillTono): ComponentFixture<Pill> {
    const fixture = TestBed.createComponent(Pill);
    fixture.componentRef.setInput('contenido', 'X');
    fixture.componentRef.setInput('tono', tono);
    fixture.detectChanges();
    return fixture;
  }

  it('muestra el contenido y el tono neutral por defecto', async () => {
    const fixture = await render('Abierto');
    const el = fixture.debugElement.query(By.css('.ph-pill'));
    expect(el.nativeElement.textContent.trim()).toBe('Abierto');
    expect(el.nativeElement.className).toContain('ph-pill');
    expect(el.nativeElement.className).toContain('neutral');
  });

  it('aplica el tono solicitado', async () => {
    const fixture = await render('Aprobado', 'ok');
    const el = fixture.debugElement.query(By.css('.ph-pill'));
    expect(el.nativeElement.textContent.trim()).toBe('Aprobado');
    expect(el.nativeElement.className).toContain('ok');
  });

  it('mantiene la clase base con tonos de estado', async () => {
    for (const tono of ['info', 'warn', 'danger', 'neutral', 'primario'] as const) {
      const fixture = renderSinModulo(tono);
      const el = fixture.debugElement.query(By.css('.ph-pill'));
      expect(el.nativeElement.className).toContain('ph-pill');
      expect(el.nativeElement.className).toContain(tono);
    }
  });
});
