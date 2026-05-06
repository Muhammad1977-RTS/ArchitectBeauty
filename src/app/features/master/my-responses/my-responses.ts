import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ResponseService } from '../../../core/services/response.service';
import { Response } from '../../../core/models/types';

@Component({
  selector: 'app-my-responses',
  imports: [RouterLink],
  templateUrl: './my-responses.html',
})
export class MasterMyResponsesComponent implements OnInit {
  private auth = inject(AuthService);
  private responseService = inject(ResponseService);

  readonly loading = signal(true);
  readonly responses = signal<Response[]>([]);

  async ngOnInit() {
    const user = this.auth.user();
    if (!user) { this.loading.set(false); return; }
    this.responses.set(await this.responseService.getMyResponses(user.id));
    this.loading.set(false);
  }

  statusLabel(status: string): string {
    const map: Record<string, string> = {
      new: 'Новая',
      master_selected: 'Мастер выбран',
      completed: 'Завершена',
    };
    return map[status] ?? status;
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('ru-RU', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  }

  formatPrice(price: number): string {
    return price.toLocaleString('ru-RU') + ' ₽';
  }

  isSelected(r: Response): boolean {
    return r.orders?.status === 'master_selected' && r.orders?.selected_master_id === r.master_id;
  }
}
