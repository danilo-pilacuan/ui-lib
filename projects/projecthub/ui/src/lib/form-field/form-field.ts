import {
  ChangeDetectionStrategy,
  Component,
  Directive,
  contentChildren,
  effect,
  inject,
  input,
  viewChild,
} from '@angular/core';
import {
  MAT_FORM_FIELD,
  MatFormField,
  MatFormFieldControl,
  MatFormFieldModule,
} from '@angular/material/form-field';
import { Subject } from 'rxjs';

let bridgeSeq = 0;

/**
 * Nodo puente interno (DEC-005): la content query de mat-form-field solo ve
 * lo declarado en su propia plantilla, y el control del consumidor llega
 * proyectado a traves del ng-content de ph-form-field, de modo que sin este
 * nodo la validacion de mat-form-field falla. Declara un MatFormFieldControl
 * de reserva dentro de mat-form-field y se asigna como _control en su
 * constructor (antes de cualquier lifecycle). FormField intercambia _control
 * por el control real en cuanto su contentChildren lo descubre; al siguiente
 * ngAfterContentChecked, mat-form-field lo reinicializa de forma nativa
 * (re-suscribe stateChanges/valueChanges y cambia la clase por controlType).
 */
@Directive({
  selector: '[phFormFieldBridge]',
  providers: [{ provide: MatFormFieldControl, useExisting: FormFieldBridge }],
  host: { class: 'ph-field-bridge' },
})
class FormFieldBridge implements MatFormFieldControl<unknown> {
  readonly id = `ph-form-field-bridge-${++bridgeSeq}`;
  readonly ngControl = null;
  readonly ngField = null;
  readonly stateChanges = new Subject<void>();
  readonly disableAutomaticLabeling = true;

  focused = false;
  empty = true;
  shouldLabelFloat = false;
  required = false;
  disabled = false;
  errorState = false;

  constructor() {
    const formField = inject(MAT_FORM_FIELD, { optional: true });
    if (formField) {
      formField._control = this;
    }
  }

  setDescribedByIds(_ids: string[]): void {
    // Nodo de reserva: sin descripciones que registrar.
  }

  onContainerClick(_event: MouseEvent): void {
    // Nodo de reserva: sin interaccion; tras el intercambio la plantilla
    // delega en el onContainerClick del control real.
  }
}

/*
 * Campo de formulario con etiqueta, pista y error (9.2).
 * Base Material (DEC-005): envuelve mat-form-field; el control va en
 * ng-content y DEBE llevar matInput (input/textarea) o mat-select. Un
 * checkbox o radio nunca va dentro de ph-form-field (no son controles de
 * form-field). El estado de error lo marca el consumidor con error() para no
 * acoplar la lib a ReactiveForms: por eso error/pista se pintan fuera del
 * subscript de Material, que depende del errorState del control.
 */
@Component({
  selector: 'ph-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatFormFieldModule, FormFieldBridge],
  template: `
    <mat-form-field appearance="outline" subscriptSizing="dynamic" class="ph-field">
      <mat-label class="ph-field-label">
        {{ label() }}
        @if (requerido()) {
          <span class="ph-field-req" aria-hidden="true">*</span>
        }
      </mat-label>
      <span phFormFieldBridge></span>
      <ng-content />
    </mat-form-field>
    @if (error(); as msg) {
      <span class="ph-field-error" role="alert">{{ msg }}</span>
    } @else if (pista(); as pista) {
      <span class="ph-field-hint">{{ pista }}</span>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
      .ph-field {
        width: 100%;
        font-size: var(--ph-font-size-md, 0.9375rem);
      }
      .ph-field-bridge {
        display: none;
      }
      .ph-field-req {
        color: var(--ph-color-danger, #c62828);
      }
      .ph-field-hint {
        display: block;
        margin-top: 0.25rem;
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-text-soft, #666);
      }
      .ph-field-error {
        display: block;
        margin-top: 0.25rem;
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-danger, #c62828);
        font-weight: 600;
      }
    `,
  ],
})
export class FormField {
  readonly label = input.required<string>();
  readonly requerido = input(false);
  readonly error = input<string | null>(null);
  readonly pista = input<string | null>(null);

  private readonly matField = viewChild(MatFormField);
  private readonly bridge = viewChild(FormFieldBridge);
  private readonly controls = contentChildren(MatFormFieldControl, {
    descendants: true,
  });

  constructor() {
    effect(() => {
      const field = this.matField();
      const bridge = this.bridge();
      if (!field || !bridge) {
        return;
      }
      const real = this.controls()[0] ?? null;
      if (real && field._control !== real) {
        field._control = real;
        bridge.stateChanges.next();
      } else if (!real && field._control !== bridge) {
        // Sin control real (uso incorrecto del consumidor): queda el nodo de
        // reserva para que mat-form-field no lance su error de validacion.
        field._control = bridge;
      }
    });
  }
}
