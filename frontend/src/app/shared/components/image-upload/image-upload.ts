import { Component, input, output, signal, effect, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-image-upload',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './image-upload.html',
})
export class ImageUploadComponent implements OnDestroy {
  previewUrl = input<string | undefined>(undefined);
  maxSize = input<number | undefined>(undefined);
  disabled = input<boolean>(false);
  label = input<string>('Upload image');
  aspectRatio = input<'square' | 'video' | 'auto'>('auto');

  imageSelected = output<File>();
  error = output<string>();
  removed = output<void>();

  currentPreview = signal<string | undefined>(undefined);
  private objectUrl: string | undefined;

  constructor() {
    effect(() => {
      this.revoke();
      const external = this.previewUrl();
      this.currentPreview.set(external);
    });
  }

  ngOnDestroy(): void {
    this.revoke();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      this.error.emit('Please select an image file.');
      return;
    }
    const maxSize = this.maxSize();
    if (maxSize && file.size > maxSize) {
      this.error.emit(`Image exceeds maximum size.`);
      return;
    }
    this.revoke();
    this.objectUrl = URL.createObjectURL(file);
    this.currentPreview.set(this.objectUrl);
    this.imageSelected.emit(file);
  }

  remove(): void {
    this.revoke();
    this.currentPreview.set(undefined);
    this.removed.emit();
  }

  private revoke(): void {
    if (this.objectUrl) {
      URL.revokeObjectURL(this.objectUrl);
      this.objectUrl = undefined;
    }
  }
}
