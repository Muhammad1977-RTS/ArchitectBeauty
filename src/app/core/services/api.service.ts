import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private base = environment.apiUrl;

  private headers(): HttpHeaders {
    const token = localStorage.getItem('jwt');
    return token
      ? new HttpHeaders({ Authorization: `Bearer ${token}` })
      : new HttpHeaders();
  }

  get<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.get<T>(`${this.base}${path}`, { headers: this.headers() }));
  }

  post<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.post<T>(`${this.base}${path}`, body, { headers: this.headers() }));
  }

  put<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.put<T>(`${this.base}${path}`, body, { headers: this.headers() }));
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    return firstValueFrom(this.http.patch<T>(`${this.base}${path}`, body, { headers: this.headers() }));
  }

  delete<T>(path: string): Promise<T> {
    return firstValueFrom(this.http.delete<T>(`${this.base}${path}`, { headers: this.headers() }));
  }
}
