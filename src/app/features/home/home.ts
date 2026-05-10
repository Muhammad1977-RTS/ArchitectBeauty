import { Component, inject, OnInit } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';

@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);
  private profile = inject(ProfileService);
  private router = inject(Router);

  readonly isAuthenticated = this.auth.isAuthenticated;

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) return;

    const p = await this.profile.getProfile(user.id);
    if (p?.role === 'master') {
      await this.router.navigate(['/master/orders']);
    } else if (p?.role === 'client') {
      await this.router.navigate(['/client/orders']);
    }
  }

  readonly workCategories = [
    { label: 'Сантехника', icon: '🚿' },
    { label: 'Электрика', icon: '⚡' },
    { label: 'Укладка плитки', icon: '🪟' },
    { label: 'Малярные работы', icon: '🎨' },
    { label: 'Отделка', icon: '🏗️' },
    { label: 'Двери и окна', icon: '🚪' },
    { label: 'Полы', icon: '📐' },
    { label: 'Потолки', icon: '🔲' },
  ];
}
