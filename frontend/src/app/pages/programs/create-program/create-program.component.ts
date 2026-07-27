import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ProgramsService } from '../../../services/programs.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-program',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, PageHeaderComponent],
  templateUrl: './create-program.component.html',
})
export class CreateProgramComponent {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);
  private readonly programsService = inject(ProgramsService);



  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
    coverImageUrl: [''],
    startDate: [''],
    endDate: [''],
  });

  readonly mutation = this.programsService.createMutation;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.mutation.mutate(
      {
        title: value.title ?? '',
        description: value.description || undefined,
        coverImageUrl: value.coverImageUrl || undefined,
        startDate: value.startDate || undefined,
        endDate: value.endDate || undefined,
      },
      {
        onSuccess: () => void this.router.navigate(['/programs']),
      }
    );
  }
}
