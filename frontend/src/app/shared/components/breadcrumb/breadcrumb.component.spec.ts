import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { By } from '@angular/platform-browser';
import { BreadcrumbComponent, BreadcrumbItem } from './breadcrumb.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [BreadcrumbComponent],
  template: `
    <app-breadcrumb [items]="items()" />
  `,
})
class TestHostComponent {
  readonly items = signal<BreadcrumbItem[]>([
    { label: 'Home', route: ['/'] },
    { label: 'Programs', route: ['/programs'] },
    { label: 'Detail' },
  ]);
}

describe('BreadcrumbComponent', () => {
  let fixture: ComponentFixture<TestHostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestHostComponent],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TestHostComponent);
  });

  it('should create', () => {
    fixture.detectChanges();
    expect(fixture).toBeTruthy();
  });

  it('should render breadcrumb items', () => {
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('li');
    expect(items.length).toBe(3);
    expect(items[0].textContent).toContain('Home');
    expect(items[2].textContent).toContain('Detail');
  });

  it('should render links for items with route', () => {
    fixture.detectChanges();
    const links = fixture.debugElement.queryAll(By.css('a'));
    expect(links.length).toBe(2);
    expect(links[0].attributes['href']).toBe('/');
  });

  it('should render separator between items', () => {
    fixture.detectChanges();
    const separators = fixture.nativeElement.querySelectorAll('.app-breadcrumb-separator');
    expect(separators.length).toBe(2);
  });
});
