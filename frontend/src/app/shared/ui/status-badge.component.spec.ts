import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';

describe('StatusBadgeComponent', () => {
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();
    fixture = TestBed.createComponent(StatusBadgeComponent);
  });

  it('maps active and completed statuses to success', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.status-success')).toBeTruthy();

    fixture.componentRef.setInput('status', 'COMPLETED');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.status-success')).toBeTruthy();
  });

  it('maps published and submitted statuses to primary', () => {
    fixture.componentRef.setInput('status', 'PUBLISHED');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.status-primary')).toBeTruthy();

    fixture.componentRef.setInput('status', 'SUBMITTED');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.status-primary')).toBeTruthy();
  });

  it('maps revoked and archived statuses to destructive and warning classes', () => {
    fixture.componentRef.setInput('status', 'REVOKED');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.status-danger')).toBeTruthy();

    fixture.componentRef.setInput('status', 'ARCHIVED');
    fixture.detectChanges();
    expect((fixture.nativeElement as HTMLElement).querySelector('.status-warning')).toBeTruthy();
  });
});
