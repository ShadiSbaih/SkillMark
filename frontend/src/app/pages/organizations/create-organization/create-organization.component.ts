import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { OrganizationsService } from '../../../services/organizations.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-create-organization',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, PageHeaderComponent],
  templateUrl: './create-organization.component.html',
  styleUrl: './create-organization.component.scss',
})
export class CreateOrganizationComponent {
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly organizationsService = inject(OrganizationsService);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', Validators.maxLength(500)],
  });

  readonly mutation = this.organizationsService.createMutation;

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.mutation.mutate(
      {
        name: this.form.value.name ?? '',
        description: this.form.value.description ?? undefined,
      },
      {
        onSuccess: () => void this.router.navigate(['/organizations']),
      }
    );
  }
}
