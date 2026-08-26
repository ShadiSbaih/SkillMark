import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { FormFieldComponent } from './form-field.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [FormFieldComponent],
  template: `
    <app-form-field [label]="label()" [hint]="hint()" [error]="error()" [id]="id()">
      <input id="name" type="text" />
    </app-form-field>
  `,
})
class TestHostComponent {
  readonly label = signal<string | undefined>('Name');
  readonly hint = signal<string | undefined>('Enter your name');
  readonly error = signal<string | undefined>(undefined);
  readonly id = signal('name');
}

describe('FormFieldComponent', () => {
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

  it('should render label', () => {
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label).toBeTruthy();
    expect(label.textContent).toContain('Name');
    expect(label.getAttribute('for')).toBe('name');
  });

  it('should render hint when no error', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Enter your name');
  });

  it('should render error instead of hint when error is provided', () => {
    host.error.set('Name is required');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Name is required');
    expect(fixture.nativeElement.textContent).not.toContain('Enter your name');
  });

  it('should project content', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('input')).toBeTruthy();
  });
});
