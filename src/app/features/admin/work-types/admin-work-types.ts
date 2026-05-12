import { Component, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AdminService } from '../../../core/services/admin.service';
import { WorkType } from '../../../core/models/types';

@Component({
  selector: 'app-admin-work-types',
  imports: [RouterLink, RouterLinkActive, FormsModule],
  templateUrl: './admin-work-types.html',
})
export class AdminWorkTypesComponent implements OnInit {
  private adminService = inject(AdminService);

  readonly loading = signal(true);
  readonly workTypes = signal<WorkType[]>([]);
  readonly deletingId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);

  newName = '';

  async ngOnInit() {
    await this.load();
  }

  private async load() {
    this.loading.set(true);
    this.workTypes.set(await this.adminService.getWorkTypes());
    this.loading.set(false);
  }

  private toSlug(name: string): string {
    return name.trim().toLowerCase()
      .replace(/[а-яёА-ЯЁ]/g, c => ({
        'а':'a','б':'b','в':'v','г':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
        'и':'i','й':'j','к':'k','л':'l','м':'m','н':'n','о':'o','п':'p','р':'r',
        'с':'s','т':'t','у':'u','ф':'f','х':'h','ц':'ts','ч':'ch','ш':'sh','щ':'sch',
        'ъ':'','ы':'y','ь':'','э':'e','ю':'yu','я':'ya',
        'А':'a','Б':'b','В':'v','Г':'g','Д':'d','Е':'e','Ё':'yo','Ж':'zh','З':'z',
        'И':'i','Й':'j','К':'k','Л':'l','М':'m','Н':'n','О':'o','П':'p','Р':'r',
        'С':'s','Т':'t','У':'u','Ф':'f','Х':'h','Ц':'ts','Ч':'ch','Ш':'sh','Щ':'sch',
        'Ъ':'','Ы':'y','Ь':'','Э':'e','Ю':'yu','Я':'ya',
      }[c] ?? c))
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_]/g, '');
  }

  async add() {
    const name = this.newName.trim();
    if (!name) return;
    this.error.set(null);
    this.saving.set(true);
    const slug = this.toSlug(name);
    const ok = await this.adminService.addWorkType(name, slug);
    if (ok) {
      this.newName = '';
      await this.load();
    } else {
      this.error.set('Не удалось добавить. Возможно, такой вид работ уже существует.');
    }
    this.saving.set(false);
  }

  async deleteWorkType(wt: WorkType) {
    if (!confirm(`Удалить «${wt.name}»?`)) return;
    this.deletingId.set(wt.id);
    const ok = await this.adminService.deleteWorkType(wt.id);
    if (ok) this.workTypes.update(list => list.filter(w => w.id !== wt.id));
    this.deletingId.set(null);
  }
}
