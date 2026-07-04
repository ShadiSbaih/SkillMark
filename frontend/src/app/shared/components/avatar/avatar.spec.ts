import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AvatarComponent } from './avatar';

describe('AvatarComponent', () => {
  let fixture: ComponentFixture<AvatarComponent>;
  let component: AvatarComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
  });

  const detect = (): HTMLElement => {
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('.avatar') as HTMLElement;
  };

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an image when src is provided', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.png');
    fixture.componentRef.setInput('alt', 'User avatar');

    const root = detect();
    const img = root.querySelector('img');

    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('https://example.com/avatar.png');
    expect(img?.getAttribute('alt')).toBe('User avatar');
  });

  it('should default alt to an empty string', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.png');

    const root = detect();

    expect(root.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('should render fallback when no src is provided', () => {
    fixture.componentRef.setInput('fallback', 'JD');

    const root = detect();

    expect(root.textContent?.trim()).toBe('JD');
    expect(root.querySelector('img')).toBeNull();
  });

  it('should render fallback when the image fails to load', () => {
    fixture.componentRef.setInput('src', 'https://example.com/broken.png');
    fixture.componentRef.setInput('fallback', 'JD');

    const root = detect();
    const img = root.querySelector('img');

    expect(img).toBeTruthy();

    img?.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    expect(root.querySelector('img')).toBeNull();
    expect(root.textContent?.trim()).toBe('JD');
  });

  it('should apply size classes', () => {
    fixture.componentRef.setInput('size', 'xl');

    const root = detect();

    expect(root.classList.contains('xl')).toBe(true);
  });

  it('should apply rounded classes', () => {
    fixture.componentRef.setInput('rounded', 'md');

    const root = detect();

    expect(root.classList.contains('rounded-md')).toBe(true);
    expect(root.classList.contains('rounded-full')).toBe(false);
  });

  it('should use aria-label from alt when provided', () => {
    fixture.componentRef.setInput('alt', 'User avatar');
    fixture.componentRef.setInput('fallback', 'JD');

    const root = detect();

    expect(root.getAttribute('aria-label')).toBe('User avatar');
  });

  it('should use fallback as aria-label when alt is not provided', () => {
    fixture.componentRef.setInput('fallback', 'JD');

    const root = detect();

    expect(root.getAttribute('aria-label')).toBe('JD');
  });
});
