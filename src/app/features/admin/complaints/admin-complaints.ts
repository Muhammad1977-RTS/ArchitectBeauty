import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { ComplaintService, Complaint } from '../../../core/services/complaint.service';

type StatusFilter = 'all' | 'pending' | 'reviewed' | 'dismissed';

@Component({
  selector: 'app-admin-complaints',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './admin-complaints.html',
})
export class AdminComplaintsComponent implements OnInit {
  private complaintService = inject(ComplaintService);
  private adminService = inject(AdminService);

  readonly loading = signal(true);
  readonly complaints = signal<Complaint[]>([]);
  readonly filter = signal<StatusFilter>('pending');
  readonly actionId = signal<string | null>(null);

  async ngOnInit() {
    await this.load();
  }

  async setFilter(f: StatusFilter) {
    this.filter.set(f);
  }

  private async load() {
    this.loading.set(true);
    this.complaints.set(await this.complaintService.getAll());
    this.loading.set(false);
  }

  filtered(): Complaint[] {
    const f = this.filter();
    if (f === 'all') return this.complaints();
    return this.complaints().filter(c => c.status === f);
  }

  async dismiss(c: Complaint) {
    this.actionId.set(c.id);
    const ok = await this.complaintService.dismiss(c.id);
    if (ok) this.complaints.update(list => list.map(x => x.id === c.id ? { ...x, status: 'dismissed' } : x));
    this.actionId.set(null);
  }

  async deleteUser(c: Complaint) {
    if (!confirm(`Удалить пользователя «${c.reported_user_name}»? Все его данные будут удалены.`)) return;
    this.actionId.set(c.id);
    const ok = await this.adminService.deleteUser(c.reported_user_id);
    if (ok) {
      await this.complaintService.markReviewed(c.id);
      this.complaints.update(list => list.map(x =>
        x.id === c.id ? { ...x, status: 'reviewed' } :
        x.reported_user_id === c.reported_user_id ? { ...x, status: 'reviewed' } : x
      ));
    }
    this.actionId.set(null);
  }

  statusLabel(s: string): string {
    return { pending: 'Новая', reviewed: 'Обработана', dismissed: 'Отклонена' }[s] ?? s;
  }

  formatDate(iso: string | null | undefined): string {
    if (!iso) return '';
    const d = new Date(iso);
    if (isNaN(d.getTime())) return '';
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' });
  }
}
