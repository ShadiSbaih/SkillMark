import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { OrganizationsService } from '../../../services/organizations.service';
import { ButtonComponent } from '../../../shared/components/button/button.component';
import { CardComponent } from '../../../shared/components/card/card.component';
import { FormFieldComponent } from '../../../shared/components/form-field/form-field.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { CreateOrganizationRequest, OrganizationResponse } from '../../../core/models/organization.model';

@Component({
  selector: 'app-create-organization',
  standalone: true,
  imports: [ReactiveFormsModule, ButtonComponent, CardComponent, FormFieldComponent, PageHeaderComponent, RouterLink],
  templateUrl: './create-organization.component.html',
  styleUrl: './create-organization.component.scss',
})
export class CreateOrganizationComponent {
  readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly organizationsService = inject(OrganizationsService);

  readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    slug: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)]],
    description: ['', Validators.maxLength(500)],
    logoUrl: ['', Validators.maxLength(500)],
  });

  readonly mutation = this.organizationsService.createMutation;

  generateSlugFromName(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')
      .slice(0, 50);
  }

  onNameChange(): void {
    const name = this.form.value.name ?? '';
    const slugControl = this.form.get('slug');
    if (slugControl && !slugControl.dirty) {
      slugControl.setValue(this.generateSlugFromName(name));
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    this.mutation.mutate(
      {
        name: value.name ?? '',
        description: value.description || undefined,
        logoUrl: value.logoUrl || undefined,
      } satisfies CreateOrganizationRequest,
      {
        onSuccess: (data: OrganizationResponse) => {
          void this.router.navigate(['/organizations', data.id]);
        },
      }
    );
  }
}
