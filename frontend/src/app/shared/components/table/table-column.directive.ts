import { Directive, input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[appTableColumn]',
  standalone: true,
})
export class TableColumnDirective {
  readonly name = input.required<string>({ alias: 'appTableColumn' });

  constructor(public readonly templateRef: TemplateRef<{ $implicit: unknown; item: unknown; value: unknown }>) {}
}
