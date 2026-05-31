import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { UserRole } from '../../core/models/types';

interface Tab {
  tab: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  standalone: false,
})
export class TabsPage implements OnInit {
  tabs: Tab[] = [];

  private tabsByRole: Record<UserRole, Tab[]> = {
    client: [
      { tab: 'client-orders', label: 'Заявки', icon: 'briefcase' },
      { tab: 'client-transport', label: 'Перевозка', icon: 'car' },
      { tab: 'shops', label: 'Магазины', icon: 'storefront' },
      { tab: 'profile', label: 'Профиль', icon: 'person' },
    ],
    master: [
      { tab: 'master-orders', label: 'Заказы', icon: 'hammer' },
      { tab: 'master-responses', label: 'Отклики', icon: 'chatbubbles' },
      { tab: 'profile', label: 'Профиль', icon: 'person' },
    ],
    carrier: [
      { tab: 'carrier-orders', label: 'Грузы', icon: 'car' },
      { tab: 'carrier-responses', label: 'Отклики', icon: 'chatbubbles' },
      { tab: 'profile', label: 'Профиль', icon: 'person' },
    ],
    store: [
      { tab: 'store-products', label: 'Товары', icon: 'storefront' },
      { tab: 'profile', label: 'Профиль', icon: 'person' },
    ],
  };

  constructor(public auth: AuthService) {}

  ngOnInit() {
    const role = this.auth.appUser()?.role ?? 'client';
    this.tabs = this.tabsByRole[role] ?? this.tabsByRole['client'];
  }
}
