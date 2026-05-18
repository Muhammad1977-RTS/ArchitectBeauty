import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { OrderService } from '../../../core/services/order.service';
import { StorageService } from '../../../core/services/storage.service';
import { ProfileService } from '../../../core/services/profile.service';
import { WorkType } from '../../../core/models/types';

@Component({
  selector: 'app-order-create',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './order-create.html',
})
export class OrderCreateComponent implements OnInit {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private orderService = inject(OrderService);
  private storageService = inject(StorageService);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  readonly workTypes = signal<WorkType[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly previews = signal<string[]>([]);
  private selectedFiles: File[] = [];

  readonly selectedWorkTypeSlug = signal('');
  readonly isOther = computed(() => this.selectedWorkTypeSlug() === 'other');
  readonly isUnitBased = computed(() => this.selectedWorkTypeSlug() === 'furniture_assembly');

  form = this.fb.group({
    work_type_id: ['', Validators.required],
    work_type_custom: [''],
    area_sqm: [null as number | null, [Validators.required, Validators.min(1)]],
    address: ['', Validators.required],
    description: [''],
  });

  async ngOnInit() {
    const types = await this.profileService.getWorkTypes();
    // "Другое" всегда в конце списка
    const other = types.find(w => w.slug === 'other');
    const rest = types.filter(w => w.slug !== 'other').sort((a, b) => a.name.localeCompare(b.name, 'ru'));
    this.workTypes.set(other ? [...rest, other] : rest);
  }

  selectWorkTypeById(id: string) {
    const wt = this.workTypes().find(w => w.id === id);
    if (wt) this.selectWorkType(wt);
  }

  selectWorkType(wt: WorkType) {
    this.form.patchValue({ work_type_id: wt.id });
    this.selectedWorkTypeSlug.set(wt.slug ?? '');
    if (wt.slug !== 'other') {
      this.form.patchValue({ work_type_custom: '' });
    }
  }

  onPhotos(event: Event) {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    const MAX_SIZE_MB = 10;
    const allowed = Array.from(input.files).filter(f => {
      if (f.size > MAX_SIZE_MB * 1024 * 1024) {
        this.error.set(`Файл "${f.name}" превышает ${MAX_SIZE_MB} МБ. Выберите меньший файл.`);
        return false;
      }
      return true;
    });
    const files = allowed.slice(0, 5 - this.selectedFiles.length);
    this.selectedFiles = [...this.selectedFiles, ...files].slice(0, 5);
    this.previews.set(this.selectedFiles.map(f => URL.createObjectURL(f)));
  }

  removePhoto(index: number) {
    this.selectedFiles = this.selectedFiles.filter((_, i) => i !== index);
    this.previews.update(p => p.filter((_, i) => i !== index));
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    if (this.isOther() && !this.form.value.work_type_custom?.trim()) {
      this.error.set('Опишите, какой вид работы вам нужен.');
      return;
    }

    const user = this.auth.user();
    if (!user) return;

    this.loading.set(true);
    this.error.set(null);

    const photoUrls: string[] = [];
    for (const file of this.selectedFiles) {
      const result = await this.storageService.uploadPhoto(file, user.id);
      if (result.url) {
        photoUrls.push(result.url);
      } else {
        console.error(`Failed to upload ${file.name}:`, result.error);
      }
    }

    if (this.selectedFiles.length > 0 && photoUrls.length === 0) {
      this.error.set('Не удалось загрузить фотографии. Проверьте подключение и попробуйте снова.');
      this.loading.set(false);
      return;
    }

    const { work_type_id, work_type_custom, area_sqm, address, description } = this.form.value;
    const fullDescription = this.isOther() && work_type_custom?.trim()
      ? `Вид работы: ${work_type_custom.trim()}${description?.trim() ? '\n\n' + description.trim() : ''}`
      : (description || '');
    const order = await this.orderService.createOrder({
      client_id: user.id,
      work_type_id: work_type_id!,
      area_sqm: area_sqm!,
      address: address!,
      description: fullDescription,
      photo_urls: photoUrls,
    });

    this.loading.set(false);

    if (order) {
      await this.router.navigate(['/client/orders', order.id]);
    } else {
      this.error.set('Не удалось создать заявку. Попробуйте снова.');
    }
  }
}
