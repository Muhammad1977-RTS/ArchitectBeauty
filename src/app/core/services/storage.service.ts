import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  async uploadPhoto(_file: File, _userId: string): Promise<{ url: string | null; error?: string }> {
    return { url: null, error: 'Загрузка фото временно недоступна' };
  }
}
