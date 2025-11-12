import { computed, Injectable, signal } from '@angular/core';
import { GeneralInformation } from '../model/setting';

const STORAGE_KEY = 'generalInformation';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  private readonly _info = signal<GeneralInformation>({
    profilePictureUrl: '',
    fullName: '',
    roleTitle: '',
    location: '',
    businessName: '',
    emailAddress: '',
    phoneNumber: '',
    fax: '',
    country: '',
    city: '',
    state: '',
    postcode: '',
  });

  readonly info = computed(() => this._info());

  patch(partial: Partial<GeneralInformation>) {
    this._info.update(cur => ({ ...cur, ...partial }));
  }

  setAll(payload: GeneralInformation) {
    this._info.set(payload);
  }

  async load(): Promise<void> {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as GeneralInformation;
      this._info.set(parsed);
    } catch {
    }
  }

  async save(): Promise<void> {
    const payload = this._info();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
  }
  
  uploadPhoto(file: File): void {
    const url = URL.createObjectURL(file); 
    this.patch({ profilePictureUrl: url });
  }

  deletePhoto(): void {
    this.patch({ profilePictureUrl: '' });
  }
}