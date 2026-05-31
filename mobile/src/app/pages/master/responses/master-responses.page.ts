import { Component, OnInit } from '@angular/core';
import { ResponseService } from '../../../core/services/response.service';
import { AuthService } from '../../../core/services/auth.service';
import { Response } from '../../../core/models/types';

@Component({
  selector: 'app-master-responses',
  templateUrl: './master-responses.page.html',
  styleUrls: ['./master-responses.page.scss'],
  standalone: false,
})
export class MasterResponsesPage implements OnInit {
  responses: Response[] = [];
  loading = true;

  constructor(private responseService: ResponseService, private auth: AuthService) {}

  async ngOnInit() { await this.load(); }

  async load() {
    this.loading = true;
    const user = this.auth.appUser();
    if (user) this.responses = await this.responseService.getMyResponses(user.id);
    this.loading = false;
  }

  async refresh(event: any) { await this.load(); event.target.complete(); }

  statusColor(s: string) {
    const map: Record<string, string> = { new: 'new', master_selected: 'Выбрали', completed: 'Завершено' };
    return map[s] ?? s;
  }
}
