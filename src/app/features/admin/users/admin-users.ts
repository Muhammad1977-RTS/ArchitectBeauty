import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { Profile } from '../../../core/models/types';

type RoleFilter = 'all' | 'client' | 'master';

@Component({
  selector: 'app-admin-users',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-users.html',
})
export class AdminUsersComponent implements OnInit {
  private adminService = inject(AdminService);

  readonly loading = signal(true);
  readonly users = signal<Profile[]>([]);
  readonly filter = signal<RoleFilter>('all');
  readonly deletingId = signal<string | null>(null);

  async ngOnInit() {
    await this.load();
  }

  async setFilter(f: RoleFilter) {
    this.filter.set(f);
    await this.load();
  }

  private async load() {
    this.loading.set(true);
    const f = this.filter();
    const role = f === 'all' ? undefined : f;
    this.users.set(await this.adminService.getUsers(role));
    this.loading.set(false);
  }

  async deleteUser(user: Profile) {
    if (!confirm(`Удалить пользователя «${user.name}»? Все его заявки и данные будут удалены.`)) return;
    this.deletingId.set(user.id);
    const ok = await this.adminService.deleteUser(user.id);
    if (ok) this.users.update(list => list.filter(u => u.id !== user.id));
    this.deletingId.set(null);
  }

  roleLabel(role: string): string {
    return role === 'master' ? 'Мастер' : 'Клиент';
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
