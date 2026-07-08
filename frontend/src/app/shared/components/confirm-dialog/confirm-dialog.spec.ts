import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { ConfirmDialogComponent } from './confirm-dialog';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [ConfirmDialogComponent],
  template: `
    <app-confirm-dialog
      [open]="open()"
      [title]="title()"
      [message]="message()"
      [confirmText]="confirmText()"
      [cancelText]="cancelText()"
      [confirmVariant]="confirmVariant()"
      (confirm)="confirmed = true"
      (cancel)="cancelled = true"
    />
  `,
})
class TestHostComponent {
  readonly open = signal(true);
  readonly title = signal('Delete item');
  readonly message = signal('Are you sure?');
  readonly confirmText = signal('Delete');
  readonly cancelText = signal('Cancel');
  readonly confirmVariant = signal<'primary' | 'danger'>('danger');
  confirmed = false;
  cancelled = false;
}

describe('ConfirmDialogComponent', () => {
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

  it('should render title and message', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Delete item');
    expect(fixture.nativeElement.textContent).toContain('Are you sure?');
  });

  it('should emit confirm when confirm button is clicked', () => {
    fixture.detectChanges();
    const confirmButton = fixture.debugElement.query(By.css('app-button:last-child'));
    confirmButton.triggerEventHandler('clicked', undefined);
    expect(host.confirmed).toBe(true);
  });

  it('should emit cancel when cancel button is clicked', () => {
    fixture.detectChanges();
    const cancelButton = fixture.debugElement.query(By.css('app-button:first-child'));
    cancelButton.triggerEventHandler('clicked', undefined);
    expect(host.cancelled).toBe(true);
  });

  it('should pass confirmVariant to modal', () => {
    host.confirmVariant.set('primary');
    fixture.detectChanges();
    const confirmButton = fixture.debugElement.query(By.css('app-button:last-child button'));
    expect(confirmButton.nativeElement.classList).toContain('app-button-primary');
  });
});
