import { Injectable } from '@angular/core';

/*
 * Formateo con Intl (AGENTS.md DoD: fechas y montos con Intl).
 * Locale fijo es-CO: el sistema es documental y en espanol; al no depender de
 * LOCALE_ID funciona standalone en cualquier host sin registrar locale data.
 */
@Injectable({ providedIn: 'root' })
export class IntlFormat {
  private readonly locale = 'es-CO';

  fecha(valor: string | Date | null | undefined): string {
    if (!valor) {
      return '-';
    }
    const d = typeof valor === 'string' ? new Date(valor) : valor;
    if (Number.isNaN(d.getTime())) {
      return '-';
    }
    return new Intl.DateTimeFormat(this.locale, {
      year: 'numeric',
      month: 'short',
      day: '2-digit',
    }).format(d);
  }

  monto(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
      return '-';
    }
    return new Intl.NumberFormat(this.locale, {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0,
    }).format(valor);
  }

  porcentaje(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
      return '-';
    }
    return new Intl.NumberFormat(this.locale, {
      style: 'percent',
      maximumFractionDigits: 1,
    }).format(valor / 100);
  }

  numero(valor: number | null | undefined): string {
    if (valor === null || valor === undefined || Number.isNaN(valor)) {
      return '-';
    }
    return new Intl.NumberFormat(this.locale).format(valor);
  }
}
