import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { BadgeComponent } from './badge.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [BadgeComponent],
  template: `
    <app-badge [color]="color()" [style]="style()">
      Badge content
    </app-badge>
  `,
})
class TestHostComponent {
  readonly color = signal<'green' | 'amber' | 'red' | 'gray' | 'blue'>('gray');
  readonly style = signal<'subtle' | 'solid' | 'outline'>('subtle');
}

describe('BadgeComponent', () => {
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
    expect(fixture.nativeElement.textContent).toContain('Badge content');
  });

  it('should apply gray subtle classes by default', () => {
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('span'));
    expect(badge.classes['app-badge--gray-subtle']).toBe(true);
  });

  it('should apply color and style classes', () => {
    host.color.set('green');
    host.style.set('solid');
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('span'));
    expect(badge.classes['app-badge--green-solid']).toBe(true);
  });

  it('should support outline style', () => {
    host.color.set('blue');
    host.style.set('outline');
    fixture.detectChanges();
    const badge = fixture.debugElement.query(By.css('span'));
    expect(badge.classes['app-badge--blue-outline']).toBe(true);
  });
});
