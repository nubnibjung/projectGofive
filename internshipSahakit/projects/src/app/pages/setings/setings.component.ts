import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgIf, NgFor } from '@angular/common';
import { SettingService } from '../../service/setting.service';
import Swal from 'sweetalert2'

@Component({
  selector: 'app-setings',
  standalone: true,
  imports: [FormsModule, NgIf, NgFor],
  templateUrl: './setings.component.html',
  styleUrl: './setings.component.css'
})
export class SetingsComponent implements OnInit{
  readonly svc = inject(SettingService);
  readonly saving = signal(false);

  vm = computed(() => this.svc.info());

  countries = [
    { code: '',  label: 'Choose a country' },
    { code: 'TH', label: 'Thailand' },
    { code: 'US', label: 'United States' },
    { code: 'JP', label: 'Japan' },
    { code: 'GB', label: 'United Kingdom' },
  ];

  ngOnInit(): void {
    this.svc.load();
  }

  set(key: keyof ReturnType<typeof this.vm>, value: unknown) {
    this.svc.patch({ [key]: value } as any);
  }

  onFieldChange<K extends keyof ReturnType<typeof this.vm>>(field: K, raw: any) {
    const clean = this.sanitize(field as string, raw);
    this.svc.patch({ [field]: clean } as any);
  }

  private sanitize(field: string, value: any) {
    if (typeof value === 'string') {
      value = value.trim().replace(/\s{2,}/g, ' ');
      value = value.replace(/[\u0000-\u001F\u007F]+/g, '');
      value = value.replace(/[\u{1F000}-\u{1FFFF}]/gu, '');
    }

    if (field === 'emailAddress' && typeof value === 'string') {
      value = value.toLowerCase();
    }

    if ((field === 'phoneNumber' || field === 'fax') && typeof value === 'string') {
      value = value.replace(/[^0-9+\-() ]+/g, '');
      if (value.length > 20) value = value.slice(0, 20);
    }

    if (field === 'postcode' && typeof value === 'string') {
      if (this.vm().country === 'TH') {
        value = value.replace(/\D+/g, '').slice(0, 5);
      } else {
        value = value.replace(/\D+/g, '').slice(0, 10);
      }
    }

    if (typeof value === 'string' && value === '') {
      value = '';
    }

    return value;
  }

  get postcodePattern(): string {
    return this.vm().country === 'TH' ? '^\\d{5}$' : '^\\d{3,10}$';
  }

  get isSaving() { return this.saving(); }

  async onSave() {
    try {
      this.saving.set(true);
      await this.svc.save();

      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'success',
        title: 'Saved successfully!',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    } catch (err: any) {
      const msg = (err?.message ?? 'Please try again.') as string;
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'error',
        title: 'Save failed',
        html: `<small>${this.escapeHtml(msg)}</small>`,
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
      });
    } finally {
      this.saving.set(false);
    }
  }

  async onCancel() {
    const res = await Swal.fire({
      icon: 'question',
      title: 'Discard changes?',
      text: 'All unsaved changes will be lost.',
      showCancelButton: true,
      confirmButtonText: 'Discard',
      cancelButtonText: 'Keep editing',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#5B34EA',
    });

    if (res.isConfirmed) {
      await this.svc.load();
      await Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Changes discarded',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
      });
    }
  }

  onDeletePhoto() {
    this.svc.deletePhoto();
  }

  onUploadPhoto(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (file) this.svc.uploadPhoto(file);
  }

  private escapeHtml(s: string) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
}