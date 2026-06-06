import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private http = inject(HttpClient);
  private base = environment.apiUrl.replace('/api', '');

  async uploadPhoto(file: File, _userId: string): Promise<{ url: string | null; error?: string }> {
    try {
      const form = new FormData();
      form.append('file', file);
      const token = localStorage.getItem('jwt');
      const res = await firstValueFrom(
        this.http.post<{ url: string }>(`${environment.apiUrl}/uploads/photo`, form, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        })
      );
      return { url: `${this.base}${res.url}` };
    } catch (e) {
      return { url: null, error: e instanceof Error ? e.message : 'Upload failed' };
    }
  }
}
