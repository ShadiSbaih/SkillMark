import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { PaginationComponent } from './pagination.component';

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [PaginationComponent],
  template: `
    <app-pagination
      [page]="page()"
      [size]="size()"
      [totalElements]="totalElements()"
      [totalPages]="totalPages()"
      [hasNext]="hasNext()"
      [hasPrevious]="hasPrevious()"
      (pageChange)="onPageChange($event)"
    />
  `,
})
class TestHostComponent {
  readonly page = signal(2);
  readonly size = signal(10);
  readonly totalElements = signal(35);
  readonly totalPages = signal(4);
  readonly hasNext = signal(true);
  readonly hasPrevious = signal(true);
  changedPage: number | null = null;

  onPageChange(page: number): void {
    this.changedPage = page;
  }
}

describe('PaginationComponent', () => {
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

  it('should display current page and total pages', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Page 2 of 4');
  });

  it('should emit previous page when previous button is clicked', () => {
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('app-button'));
    buttons[0].triggerEventHandler('clicked', undefined);
    expect(host.changedPage).toBe(1);
  });

  it('should emit next page when next button is clicked', () => {
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('app-button'));
    buttons[1].triggerEventHandler('clicked', undefined);
    expect(host.changedPage).toBe(3);
  });

  it('should disable previous button when hasPrevious is false', () => {
    host.hasPrevious.set(false);
    fixture.detectChanges();
    const buttons = fixture.debugElement.queryAll(By.css('app-button'));
    expect(buttons[0].attributes['ng-reflect-disabled']).toBe('true');
  });

  it('should not render pagination when there is only one page', () => {
    host.totalPages.set(1);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.app-pagination')).toBeFalsy();
  });
});
