import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/*
 * Campo de formulario con etiqueta, pista y error (9.2).
 * El control (input/select/textarea) va en ng-content; el estado de error lo
 * marca el consumidor con error() para no acoplar la lib a ReactiveForms.
 */
@Component({
  selector: 'ph-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="ph-field">
      <span class="ph-field-label">
        {{ label() }}
        @if (requerido()) {
          <span class="ph-field-req" aria-hidden="true">*</span>
        }
      </span>
      <span class="ph-field-control"><ng-content /></span>
      @if (error(); as msg) {
        <span class="ph-field-error" role="alert">{{ msg }}</span>
      } @else if (pista(); as pista) {
        <span class="ph-field-hint">{{ pista }}</span>
      }
    </label>
  `,
  styles: [
    `
      .ph-field {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }
      .ph-field-label {
        font-size: var(--ph-font-size-sm, 0.8125rem);
        font-weight: 600;
        color: var(--ph-color-text, #222);
      }
      .ph-field-req {
        color: var(--ph-color-danger, #c62828);
      }
      .ph-field-control :is(input, select, textarea) {
        width: 100%;
        box-sizing: border-box;
        padding: 0.45rem 0.6rem;
        border: 1px solid var(--ph-color-border, #d9d9d9);
        border-radius: var(--ph-radius, 6px);
        font: inherit;
        font-size: var(--ph-font-size-md, 0.9375rem);
        background: var(--ph-color-surface, #fff);
        color: var(--ph-color-text, #222);
      }
      .ph-field-control :is(input, select, textarea):focus {
        outline: 2px solid var(--ph-color-primary, #1976d2);
        outline-offset: 1px;
      }
      .ph-field-control :is(input, select, textarea):disabled {
        background: var(--ph-color-neutral-soft, #f1f3f5);
        color: var(--ph-color-text-soft, #666);
      }
      .ph-field-hint {
        font-size: var(--ph-font-size-sm, 0.8125rem);
        color: var(--ph-color-text-soft, #666);
      }
      .ph-field-error {
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
}
