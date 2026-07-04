import { CommonModule } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-date-picker',
  imports: [CommonModule, FormsModule],
  templateUrl: './date-picker.html',
  styles: ``,
})
export class DatePicker {
  label = input<string>();
  value = input<string>();
  placeholder = input<string>('Select a date');
  disabled = input<boolean>(false);
  required = input<boolean>(false);
  min = input<string>();
  max = input<string>();

  dateChange = output<string>();

  onChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.dateChange.emit(target.value);
  }
}
