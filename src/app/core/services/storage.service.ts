import { Injectable, inject } from '@angular/core';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private db = inject(SupabaseService).client;
  private bucket = 'order-photos';

  async uploadPhoto(file: File, userId: string): Promise<{ url: string | null; error?: string }> {
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${userId}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await this.db.storage
      .from(this.bucket)
      .upload(path, file, { upsert: false });
    if (error) {
      console.error('Storage upload error:', error);
      return { url: null, error: error.message };
    }
    const { data } = this.db.storage.from(this.bucket).getPublicUrl(path);
    return { url: data.publicUrl };
  }
}
