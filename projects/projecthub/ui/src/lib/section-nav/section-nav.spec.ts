import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { By } from '@angular/platform-browser';
import { describe, expect, it } from 'vitest';
import { SectionNav } from './section-nav';

const LINKS = [
  { ruta: '/reports', etiqueta: 'Tablero general' },
  { ruta: '/reports/presupuesto', etiqueta: 'Presupuesto' },
];

describe('SectionNav', () => {
  it('renderiza un enlace por link con su etiqueta y aria-label', async () => {
    await TestBed.configureTestingModule({
      imports: [SectionNav],
      providers: [provideRouter([])],
    }).compileComponents();

    const fixture = TestBed.createComponent(SectionNav);
    fixture.componentRef.setInput('links', LINKS);
    fixture.componentRef.setInput('ariaLabel', 'Secciones de reportes');
    await fixture.whenStable();

    const nav = fixture.debugElement.query(By.css('nav'));
    expect(nav).toBeTruthy();
    expect(nav.nativeElement.getAttribute('aria-label')).toBe('Secciones de reportes');

    const enlaces = fixture.debugElement.queryAll(By.css('a'));
    expect(enlaces.length).toBe(2);
    expect(enlaces[0].nativeElement.textContent.trim()).toBe('Tablero general');
    expect(enlaces[0].nativeElement.getAttribute('href')).toBe('/reports');
    expect(enlaces[1].nativeElement.textContent.trim()).toBe('Presupuesto');
    expect(enlaces[1].nativeElement.getAttribute('href')).toBe('/reports/presupuesto');
  });

  it('marca activo el enlace de la ruta actual', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [SectionNav, RutaVacia],
      providers: [
        provideRouter([
          { path: 'reports', component: RutaVacia },
          { path: 'reports/presupuesto', component: RutaVacia },
        ]),
      ],
    }).compileComponents();

    const router = TestBed.inject(Router);
    const fixture = TestBed.createComponent(SectionNav);
    fixture.componentRef.setInput('links', LINKS);
    fixture.detectChanges();

    await router.navigateByUrl('/reports/presupuesto');
    await fixture.whenStable();
    fixture.detectChanges();

    const activos = fixture.debugElement.queryAll(By.css('a.activo'));
    expect(activos.length).toBe(1);
    expect(activos[0].nativeElement.textContent.trim()).toBe('Presupuesto');

    await router.navigateByUrl('/reports');
    await fixture.whenStable();
    fixture.detectChanges();

    const activosRaiz = fixture.debugElement.queryAll(By.css('a.activo'));
    expect(activosRaiz.length).toBe(1);
    expect(activosRaiz[0].nativeElement.textContent.trim()).toBe('Tablero general');
  });
});

@Component({
  template: '',
})
class RutaVacia {}
