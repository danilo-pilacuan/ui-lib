import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { MatInputModule } from '@angular/material/input';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { MatFormField } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormField } from './form-field/form-field';
import { PermissionBanner } from './permission-banner/permission-banner';
import { SummaryWidget } from './summary-widget/summary-widget';
import { IntlFormat } from './intl-format';
import { DialogoConfig, DialogoResultado, PromptDialog } from './prompt-dialog/prompt-dialog';

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

describe('PromptDialog', () => {
  interface HostOpciones {
    config: DialogoConfig;
  }

  @Component({
    selector: 'spec-host-dialogo',
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `<p>host</p>`,
  })
  class HostDialogo {
    private readonly dialog = inject(MatDialog);
    private readonly datos = inject(MAT_DIALOG_DATA) as HostOpciones;
    resultado: DialogoResultado | undefined;

    constructor() {
      this.dialog
        .open(PromptDialog, { data: this.datos.config, width: '26rem' })
        .afterClosed()
        .subscribe((r) => {
          this.resultado = r;
        });
    }
  }

  function abrir(config: DialogoConfig) {
    TestBed.overrideProvider(MAT_DIALOG_DATA, { useValue: { config } });
    const fixture = TestBed.createComponent(HostDialogo);
    fixture.detectChanges();
    return fixture;
  }

  function overlay(): HTMLElement {
    return document.querySelector('.cdk-overlay-container') as HTMLElement;
  }

  function botonConfirmar(): HTMLButtonElement | undefined {
    return Array.from(overlay()?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((b) =>
      b.classList.contains('ph-btn-confirmar'),
    );
  }

  function botonPorTexto(texto: string): HTMLButtonElement | undefined {
    return Array.from(overlay()?.querySelectorAll<HTMLButtonElement>('button') ?? []).find((b) =>
      b.textContent?.includes(texto),
    );
  }

  async function esperarCierre(): Promise<void> {
    for (let i = 0; i < 50; i++) {
      if (!overlay()?.querySelector('mat-dialog-container')) {
        return;
      }
      await new Promise((r) => setTimeout(r, 10));
    }
  }

  beforeEach(() => {
    overlay()?.remove();
  });

  it('muestra titulo, mensaje y boton de confirmacion', async () => {
    const fixture = abrir({ titulo: 'Eliminar etapa', mensaje: 'Esta accion no se puede deshacer.' });
    await fixture.whenStable();
    expect(overlay().textContent).toContain('Eliminar etapa');
    expect(overlay().textContent).toContain('Esta accion no se puede deshacer.');
    expect(botonConfirmar()).toBeTruthy();
  });

  it('cierra con null al cancelar', async () => {
    const fixture = abrir({ titulo: 'Confirmar', mensaje: 'Continuar?' });
    await fixture.whenStable();
    botonPorTexto('Cancelar')!.click();
    await esperarCierre();
    expect(fixture.componentInstance.resultado).toBeNull();
  });

  it('requiere los campos requeridos antes de confirmar', async () => {
    const fixture = abrir({
      titulo: 'Registrar avance',
      campos: [{ nombre: 'porcentaje', etiqueta: 'Avance (%)', tipo: 'number', requerido: true }],
    });
    await fixture.whenStable();
    const confirmar = botonConfirmar()!;
    expect(confirmar.disabled).toBe(true);
    confirmar.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.resultado).toBeUndefined();
  });

  it('recoge los valores de los campos al confirmar', async () => {
    const fixture = abrir({
      titulo: 'Registrar consumo',
      campos: [
        { nombre: 'concepto', etiqueta: 'Concepto', tipo: 'text', requerido: true },
        { nombre: 'monto', etiqueta: 'Monto', tipo: 'number' },
      ],
    });
    await fixture.whenStable();
    const input = overlay().querySelector<HTMLInputElement>('input[type="text"]')!;
    input.value = 'Materiales';
    input.dispatchEvent(new Event('input'));
    const numero = overlay().querySelector<HTMLInputElement>('input[type="number"]')!;
    numero.value = '150000';
    numero.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    botonConfirmar()!.click();
    await esperarCierre();
    expect(fixture.componentInstance.resultado).toEqual({ concepto: 'Materiales', monto: '150000' });
  });

  it('muestra error de rango para numero fuera de min/max', async () => {
    const fixture = abrir({
      titulo: 'Registrar avance',
      campos: [{ nombre: 'porcentaje', etiqueta: 'Avance (%)', tipo: 'number', min: 0, max: 100 }],
    });
    await fixture.whenStable();
    const numero = overlay().querySelector<HTMLInputElement>('input[type="number"]')!;
    numero.value = '150';
    numero.dispatchEvent(new Event('input'));
    await fixture.whenStable();
    botonConfirmar()!.click();
    await fixture.whenStable();
    expect(overlay().textContent).toContain('valor mayor que 100');
    expect(fixture.componentInstance.resultado).toBeUndefined();
  });
});