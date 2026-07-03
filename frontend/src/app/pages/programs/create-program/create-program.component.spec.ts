import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideQueryClient, QueryClient } from '@tanstack/angular-query-experimental';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CreateProgramComponent } from './create-program.component';
import { ProgramsService } from '../../../services/programs.service';

class FakeProgramsService {
  createMutation = {
    isPending: () => false,
    mutate: vi.fn(),
  };
}

describe('CreateProgramComponent', () => {
  let component: CreateProgramComponent;
  let fixture: ComponentFixture<CreateProgramComponent>;
  let programsService: FakeProgramsService;

  beforeEach(async () => {
    programsService = new FakeProgramsService();

    await TestBed.configureTestingModule({
      imports: [CreateProgramComponent],
      providers: [
        provideRouter([]),
        provideQueryClient(new QueryClient()),
        { provide: ProgramsService, useValue: programsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CreateProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should require title and enforce max length', () => {
    const title = component.form.get('title');
    expect(title?.valid).toBe(false);

    title?.setValue('a'.repeat(101));
    expect(title?.hasError('maxlength')).toBe(true);

    title?.setValue('Valid title');
    expect(title?.valid).toBe(true);
  });

  it('should enforce description max length', () => {
    const description = component.form.get('description');
    description?.setValue('a'.repeat(501));
    expect(description?.hasError('maxlength')).toBe(true);

    description?.setValue('Short description');
    expect(description?.valid).toBe(true);
  });

  it('should not submit when form is invalid', () => {
    component.onSubmit();
    expect(programsService.createMutation.mutate).not.toHaveBeenCalled();
  });

  it('should submit with trimmed optional fields', () => {
    component.form.setValue({
      title: 'Compliance Training',
      description: 'Annual compliance course',
      coverImageUrl: 'https://example.com/image.png',
      startDate: '2026-08-01',
      endDate: '2026-08-31',
    });

    component.onSubmit();

    expect(programsService.createMutation.mutate).toHaveBeenCalledWith(
      {
        organizationId: component.organizationId,
        request: {
          title: 'Compliance Training',
          description: 'Annual compliance course',
          coverImageUrl: 'https://example.com/image.png',
          startDate: '2026-08-01',
          endDate: '2026-08-31',
        },
      },
      expect.any(Object)
    );
  });

  it('should omit empty optional fields', () => {
    component.form.setValue({
      title: 'Compliance Training',
      description: '',
      coverImageUrl: '',
      startDate: '',
      endDate: '',
    });

    component.onSubmit();

    expect(programsService.createMutation.mutate).toHaveBeenCalledWith(
      {
        organizationId: component.organizationId,
        request: {
          title: 'Compliance Training',
        },
      },
      expect.any(Object)
    );
  });
});
