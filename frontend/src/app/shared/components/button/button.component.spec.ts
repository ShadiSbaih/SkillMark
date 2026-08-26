import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ButtonComponent } from './button.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [ButtonComponent],
  template: `
    <app-button
      [variant]="variant()"
      [size]="size()"
      [disabled]="disabled()"
      [loading]="loading()"
      [fullWidth]="fullWidth()"
      (onClick)="onClick($event)"
    >
      Click me
    </app-button>
  `,
})
class TestHostComponent {
  readonly variant = signal<'primary' | 'secondary' | 'danger' | 'ghost'>('primary');
  readonly size = signal<'sm' | 'md' | 'lg'>('md');
  readonly disabled = signal(false);
  readonly loading = signal(false);
  readonly fullWidth = signal(false);
  clickedEvent: Event | null = null;

  onClick(event: Event): void {
    this.clickedEvent = event;
  }
}

describe('ButtonComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;
  let host: TestHostComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
    host = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture).toBeTruthy();
  });

  it('should render projected content', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Click me');
  });

  it('should apply primary variant class by default', () => {
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.classes['app-button-primary']).toBe(true);
  });

  it('should apply danger variant class when variant is danger', () => {
    host.variant.set('danger');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.classes['app-button-danger']).toBe(true);
  });

  it('should apply ghost variant class when variant is ghost', () => {
    host.variant.set('ghost');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.classes['app-button-ghost']).toBe(true);
  });

  it('should apply secondary variant class when variant is secondary', () => {
    host.variant.set('secondary');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.classes['app-button-secondary']).toBe(true);
  });

  it('should apply size class based on input', () => {
    host.size.set('lg');
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.classes['app-button-lg']).toBe(true);
  });

  it('should apply full width class when fullWidth is true', () => {
    host.fullWidth.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.classes['app-button-full-width']).toBe(true);
  });

  it('should disable the button when disabled is true', () => {
    host.disabled.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.properties['disabled']).toBe(true);
  });

  it('should disable the button and show spinner when loading is true', () => {
    host.loading.set(true);
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    expect(button.properties['disabled']).toBe(true);
    expect(fixture.nativeElement.querySelector('.spinner')).toBeTruthy();
  });

  it('should emit onClick event when clicked', () => {
    fixture.detectChanges();
    const button = fixture.debugElement.query(By.css('button'));
    button.triggerEventHandler('click', { button: 0 });
    expect(host.clickedEvent).toBeTruthy();
  });
});
