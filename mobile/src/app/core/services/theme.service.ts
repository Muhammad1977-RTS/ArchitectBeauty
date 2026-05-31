import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private dark = false;

  constructor() {
    const saved = localStorage.getItem('app_theme');
    this.dark = saved ? saved === 'dark' : true;
    this.apply();
  }

  isDark(): boolean { return this.dark; }

  toggle() {
    this.dark = !this.dark;
    localStorage.setItem('app_theme', this.dark ? 'dark' : 'light');
    this.apply();
  }

  private apply() {
    document.body.classList.toggle('app-dark', this.dark);
    document.body.classList.toggle('app-light', !this.dark);
  }
}
