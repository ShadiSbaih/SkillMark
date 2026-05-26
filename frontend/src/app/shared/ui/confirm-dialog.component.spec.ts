import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ConfirmDialogComponent } from './confirm-dialog.component';

describe('ConfirmDialogComponent', () => {
  let fixture: ComponentFixture<ConfirmDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConfirmDialogComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(ConfirmDialogComponent);
  });

  it('renders when open and emits cancel and confirm', () => {
    fixture.componentRef.setInput('open', true);
    const events: string[] = [];
    fixture.componentInstance.cancel.subscribe(() => events.push('cancel'));
    fixture.componentInstance.confirm.subscribe(() => events.push('confirm'));
    fixture.detectChanges();

    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    buttons[0].click();
    buttons[1].click();

    expect(events).toEqual(['cancel', 'confirm']);
  });
});
