import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { ProfileService } from '../../core/services/profile.service';
import { ThemeService } from '../../core/services/theme.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
  standalone: false,
})
export class ProfilePage implements OnInit {
  form: FormGroup;
  saving = false;
  saved = false;

  roleLabels: Record<string, string> = {
    client: 'Клиент',
    master: 'Мастер',
    carrier: 'Перевозчик',
    store: 'Магазин',
  };

  constructor(
    private fb: FormBuilder,
    public auth: AuthService,
    private profileService: ProfileService,
    public theme: ThemeService,
  ) {
    const user = auth.appUser();
    this.form = this.fb.group({
      name: [user?.name ?? ''],
      phone: [user?.phone ?? ''],
      city_district: [user?.city_district ?? ''],
    });
  }

  async ngOnInit() {}

  async save() {
    this.saving = true;
    const user = this.auth.appUser();
    if (user) {
      await this.profileService.updateProfile(user.id, this.form.value);
    }
    this.saving = false;
    this.saved = true;
    setTimeout(() => (this.saved = false), 2000);
  }

  logout() {
    this.auth.signOut();
  }
}
