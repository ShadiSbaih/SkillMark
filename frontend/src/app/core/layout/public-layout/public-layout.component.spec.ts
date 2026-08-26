import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it } from 'vitest';
import { PublicLayoutComponent } from './public-layout.component';

describe('PublicLayoutComponent', () => {
  let fixture: ComponentFixture<PublicLayoutComponent>;
  let component: PublicLayoutComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicLayoutComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(PublicLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('renders the brand and public navigation', () => {
    const text = fixture.nativeElement.textContent;

    expect(text).toContain('Skillmark');
    expect(text).toContain('Sign in');
    expect(text).toContain('Get started');
  });

  it('renders the footer with the current year', () => {
    const footer = fixture.nativeElement.querySelector('.public-footer');

    expect(footer.textContent).toContain(
      `© ${component.currentYear} Skillmark. All rights reserved.`
    );
  });
});
