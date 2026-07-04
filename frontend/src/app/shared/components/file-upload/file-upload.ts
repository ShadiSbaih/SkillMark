import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-file-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './file-upload.html',
})
export class FileUploadComponent {
  accept = input<string>('*/*');
  multiple = input<boolean>(false);
  maxSize = input<number | undefined>(undefined);
  disabled = input<boolean>(false);
  label = input<string>('Upload file');

  filesSelected = output<File[]>();
  error = output<string>();

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = Array.from(input.files ?? []);
    this.validateAndEmit(files);
    input.value = '';
  }

  private validateAndEmit(files: File[]): void {
    const maxSize = this.maxSize();
    if (maxSize) {
      const tooLarge = files.find(f => f.size > maxSize);
      if (tooLarge) {
        this.error.emit(`File ${tooLarge.name} exceeds maximum size.`);
        return;
      }
    }
    this.filesSelected.emit(files);
  }
}
