import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

export interface SectionNavLink {
  ruta: string;
  etiqueta: string;
}

/**
 * Navegacion de secciones reutilizable entre los microfrontends.
 *
 * Renderiza una fila de enlaces tipo "pills"; el enlace activo lo marca
 * RouterLinkActive: igualdad exacta para el primer enlace (raiz de la seccion,
 * controlable con `exact`) y por prefijo para el resto.
 */
@Component({
  selector: 'ph-section-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="ph-section-nav" [attr.aria-label]="ariaLabel()">
      @for (link of links(); track link.ruta; let i = $index) {
        <a
          class="ph-section-nav__link"
          [routerLink]="link.ruta"
          routerLinkActive="activo"
          [routerLinkActiveOptions]="{ exact: i === 0 ? exact() : false }"
          >{{ link.etiqueta }}</a
        >
      }
    </nav>
  `,
  styles: [
    `
      .ph-section-nav {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-bottom: 1rem;
      }

      .ph-section-nav__link {
        display: inline-block;
        padding: 0.4rem 0.9rem;
        border-radius: 999px;
        border: 1px solid var(--ph-color-border, #d9d9d9);
        color: var(--ph-color-text, #222222);
        background: var(--ph-color-surface, #ffffff);
        text-decoration: none;
        font-size: var(--ph-font-size-sm, 0.8125rem);
        line-height: 1.8125rem;
      }

      .ph-section-nav__link:hover {
        border-color: var(--ph-color-primary, #1976d2);
        color: var(--ph-color-primary, #1976d2);
      }

      .ph-section-nav__link.activo {
        background: var(--ph-color-primary, #1976d2);
        border-color: var(--ph-color-primary, #1976d2);
        color: #ffffff;
      }
    `,
  ],
})
export class SectionNav {
  /** Enlaces a mostrar, en orden. El primero se trata como raiz (ver `exact`). */
  readonly links = input.required<SectionNavLink[]>();

  /** Etiqueta accesible del elemento nav. */
  readonly ariaLabel = input<string>('Secciones');

  /**
   * Coincidencia exacta para el primer enlace (la raiz de la seccion), para no
   * marcarlo activo cuando la URL es la de un hijo (por ejemplo un detalle).
   */
  readonly exact = input<boolean>(true);
}
