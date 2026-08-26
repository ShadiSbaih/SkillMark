import { Component, signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { TableComponent } from './table.component';
import { TableColumnDirective } from './table-column.directive';

interface TestItem {
  id: string;
  name: string;
  age: number;
}

@Component({
  selector: 'app-test-host',
  standalone: true,
  imports: [TableComponent, TableColumnDirective],
  template: `
    <app-table
      [headers]="headers()"
      [items]="items()"
      [loading]="loading()"
      [error]="error()"
      [loadingMessage]="loadingMessage()"
      [emptyMessage]="emptyMessage()"
    >
      <ng-template appTableColumn="name" let-item>
        <span class="custom-name">{{ item.name }}</span>
      </ng-template>
    </app-table>
  `,
})
class TestHostComponent {
  readonly headers = signal<string[]>(['id', 'name', 'age']);
  readonly items = signal<TestItem[]>([
    { id: '1', name: 'Alice', age: 30 },
    { id: '2', name: 'Bob', age: 25 },
  ]);
  readonly loading = signal(false);
  readonly error = signal<string | undefined>(undefined);
  readonly loadingMessage = signal('Loading data...');
  readonly emptyMessage = signal('No rows');
}

describe('TableComponent', () => {
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

  it('should render headers', () => {
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('th');
    expect(headers.length).toBe(3);
    expect(headers[0].textContent).toContain('id');
    expect(headers[1].textContent).toContain('name');
    expect(headers[2].textContent).toContain('age');
  });

  it('should render rows with cell values', () => {
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('Alice');
    expect(rows[0].textContent).toContain('30');
  });

  it('should use custom column template when provided', () => {
    fixture.detectChanges();
    const customNames = fixture.nativeElement.querySelectorAll('.custom-name');
    expect(customNames.length).toBe(2);
    expect(customNames[0].textContent).toContain('Alice');
  });

  it('should render loading state when loading is true', () => {
    host.loading.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading data...');
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('should render error state when error is provided', () => {
    host.error.set('Load failed');
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Load failed');
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });

  it('should render empty state when items are empty', () => {
    host.items.set([]);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('No rows');
    expect(fixture.nativeElement.querySelector('table')).toBeFalsy();
  });
});
