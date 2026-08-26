import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { AvatarComponent } from './avatar.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [AvatarComponent],
  template: `
    <app-avatar
      [src]="src()"
      [alt]="alt()"
      [name]="name()"
      [size]="size()"
    />
  `,
})
class TestHostComponent {
  readonly src = signal<string | undefined>(undefined);
  readonly alt = signal('User avatar');
  readonly name = signal('Alice Smith');
  readonly size = signal<'sm' | 'md' | 'lg' | 'xl'>('md');
}

describe('AvatarComponent', () => {
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

  it('should render initials fallback when no src is provided', () => {
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.avatar-initials');
    expect(initials).toBeTruthy();
    expect(initials.textContent).toBe('AS');
  });

  it('should render image when src is provided', () => {
    host.src.set('https://example.com/avatar.png');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/avatar.png');
    expect(img.getAttribute('alt')).toBe('User avatar');
  });

  it('should switch to initials when image fails to load', () => {
    host.src.set('https://example.com/broken.png');
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img'));
    img.triggerEventHandler('error', null);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.avatar-initials')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('img')).toBeFalsy();
  });

  it('should apply size class', () => {
    host.size.set('lg');
    fixture.detectChanges();
    const avatar = fixture.debugElement.query(By.css('.avatar'));
    expect(avatar.classes['avatar-lg']).toBe(true);
  });

  it('should render single initial for one-word names', () => {
    host.name.set('Alice');
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.avatar-initials');
    expect(initials.textContent).toBe('AL');
  });

  it('should render question mark when name is empty', () => {
    host.name.set('');
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.avatar-initials');
    expect(initials.textContent).toBe('?');
  });
});
