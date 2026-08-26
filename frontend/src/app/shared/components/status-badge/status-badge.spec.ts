import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { StatusBadgeComponent } from './status-badge';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should render the status text', () => {
    fixture.componentRef.setInput('status', 'PUBLISHED');
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('PUBLISHED');
  });

  it('should expose entity input', () => {
    fixture.componentRef.setInput('status', 'PUBLISHED');
    fixture.componentRef.setInput('entity', 'program');
    fixture.detectChanges();

    expect(component.entity()).toBe('program');
  });

  it('should map program PUBLISHED status to blue subtle badge', () => {
    fixture.componentRef.setInput('status', 'PUBLISHED');
    fixture.componentRef.setInput('entity', 'program');
    fixture.detectChanges();

    expect(component.color()).toBe('blue');
    expect(component.style()).toBe('subtle');
    const span = fixture.debugElement.query(By.css('app-badge span'));
    expect(span.classes['app-badge--blue-subtle']).toBe(true);
  });

  it('should map program DRAFT status to gray subtle badge', () => {
    fixture.componentRef.setInput('status', 'DRAFT');
    fixture.componentRef.setInput('entity', 'program');
    fixture.detectChanges();

    expect(component.color()).toBe('gray');
  });

  it('should map certificate ACTIVE status to green subtle badge', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.componentRef.setInput('entity', 'certificate');
    fixture.detectChanges();

    expect(component.color()).toBe('green');
  });

  it('should map certificate REVOKED status to red subtle badge', () => {
    fixture.componentRef.setInput('status', 'REVOKED');
    fixture.componentRef.setInput('entity', 'certificate');
    fixture.detectChanges();

    expect(component.color()).toBe('red');
  });

  it('should fall back to color map when entity is not provided', () => {
    fixture.componentRef.setInput('status', 'pending');
    fixture.detectChanges();

    expect(component.color()).toBe('amber');
  });

  it('should fall back to gray for unknown status without entity', () => {
    fixture.componentRef.setInput('status', 'UNKNOWN_STATUS');
    fixture.detectChanges();

    expect(component.color()).toBe('gray');
  });

  it('should fall back to color map for unknown entity status', () => {
    fixture.componentRef.setInput('status', 'CANCELLED');
    fixture.componentRef.setInput('entity', 'program');
    fixture.detectChanges();

    expect(component.color()).toBe('gray');
  });
});
