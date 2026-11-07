import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { MatInputModule } from '@angular/material/input';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormField } from './form-field/form-field';
import { PermissionBanner } from './permission-banner/permission-banner';
import { SummaryWidget } from './summary-widget/summary-widget';
import { IntlFormat } from './intl-format';

// Hosts con control real: mat-form-field exige un MatFormFieldControl
// proyectado (input con matInput o mat-select) en ngDevMode.
@Component({
  selector: 'spec-host-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, MatInputModule],
  template: `
    <ph-form-field label="Nombre" [requerido]="true" [error]="error" [pista]="pista">
      <input matInput />
    </ph-form-field>
  `,
})
class HostInput {
  error: string | null = null;
  pista: string | null = null;
}

@Component({
  selector: 'spec-host-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, MatSelectModule],
  template: `
    <ph-form-field label="Etapa">
      <mat-select>
        <mat-option value="a">A</mat-option>
      </mat-select>
    </ph-form-field>
  `,
})
class HostSelect {}

describe('FormField', () => {
  async function render(opciones: { error?: string | null; pista?: string | null } = {}) {
    await TestBed.configureTestingModule({ imports: [HostInput] }).compileComponents();
    const fixture = TestBed.createComponent(HostInput);
    fixture.componentInstance.error = opciones.error ?? null;
    fixture.componentInstance.pista = opciones.pista ?? null;
    await fixture.whenStable();
    return fixture;
  }

  it('muestra etiqueta y marca de requerido', async () => {
    const fixture = await render();
    const label = fixture.debugElement.query(By.css('.ph-field-label'));
    expect(label.nativeElement.textContent).toContain('Nombre');
    expect(fixture.debugElement.query(By.css('.ph-field-req'))).toBeTruthy();
  });

  it('muestra error con prioridad sobre la pista', async () => {
    const fixture = await render({ error: 'Campo obligatorio', pista: 'Max 100' });
    expect(fixture.debugElement.query(By.css('.ph-field-error'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ph-field-hint'))).toBeNull();
  });

  it('muestra pista cuando no hay error', async () => {
    const fixture = await render({ pista: 'Max 100' });
    expect(fixture.debugElement.query(By.css('.ph-field-hint'))).toBeTruthy();
  });

  it('renderiza mat-form-field con el input proyectado como control', async () => {
    const fixture = await render();
    const mff = fixture.debugElement.query(By.css('mat-form-field'));
    expect(mff).toBeTruthy();
    expect(mff.nativeElement.classList).toContain('ph-field');
    const input = fixture.debugElement.query(By.css('input[matinput]'));
    expect(input).toBeTruthy();
    const mffInstance = mff.injector.get(MatFormField as never) as { _control: unknown };
    expect(mffInstance._control).toBeTruthy();
  });

  it('acepta mat-select como control proyectado', async () => {
    await TestBed.configureTestingModule({ imports: [HostSelect] }).compileComponents();
    const fixture = TestBed.createComponent(HostSelect);
    await fixture.whenStable();
    expect(fixture.debugElement.query(By.css('mat-select'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.ph-field-label'))).toBeTruthy();
  });
});

describe('PermissionBanner', () => {
  async function render(variante: 'info' | 'warn' | 'danger' = 'warn') {
    await TestBed.configureTestingModule({ imports: [PermissionBanner] }).compileComponents();
    const fixture = TestBed.createComponent(PermissionBanner);
    fixture.componentRef.setInput('titulo', 'Accion no permitida');
    fixture.componentRef.setInput('detalle', 'Tu rol no tiene permiso');
    fixture.componentRef.setInput('variante', variante);
    await fixture.whenStable();
    return fixture;
  }

  it('muestra titulo y detalle', async () => {
    const fixture = await render();
    const texto = fixture.debugElement.query(By.css('.ph-banner-texto'));
    expect(texto.nativeElement.textContent).toContain('Accion no permitida');
    expect(texto.nativeElement.textContent).toContain('Tu rol no tiene permiso');
  });

  it('aplica la variante visual', async () => {
    const fixture = await render('danger');
    expect(fixture.debugElement.query(By.css('.ph-banner')).nativeElement.className).toContain(
      'ph-banner--danger',
    );
  });
});

describe('SummaryWidget', () => {
  it('muestra titulo, valor y detalle', async () => {
    await TestBed.configureTestingModule({ imports: [SummaryWidget] }).compileComponents();
    const fixture = TestBed.createComponent(SummaryWidget);
    fixture.componentRef.setInput('titulo', 'Avance promedio');
    fixture.componentRef.setInput('valor', '42,4%');
    fixture.componentRef.setInput('detalle', '3 proyectos activos');
    await fixture.whenStable();
    const el = fixture.debugElement.query(By.css('.ph-summary'));
    expect(el.nativeElement.textContent).toContain('Avance promedio');
    expect(el.nativeElement.textContent).toContain('42,4%');
    expect(el.nativeElement.textContent).toContain('3 proyectos activos');
  });
});

describe('IntlFormat', () => {
  it('formatea montos con Intl', () => {
    const intl = TestBed.inject(IntlFormat);
    expect(intl.monto(150000)).toContain('150.000');
  });

  it('formatea porcentajes con Intl', () => {
    const intl = TestBed.inject(IntlFormat);
    expect(intl.porcentaje(42.39)).toContain('42,4');
  });

  it('devuelve guion para valores nulos', () => {
    const intl = TestBed.inject(IntlFormat);
    expect(intl.monto(null)).toBe('-');
    expect(intl.fecha(null)).toBe('-');
  });
});
