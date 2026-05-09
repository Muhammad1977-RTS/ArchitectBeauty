import { Component, inject, signal, effect, OnDestroy } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { RealtimeChannel } from '@supabase/supabase-js';
import { AuthService } from '../../../core/services/auth.service';
import { ChatService } from '../../../core/services/chat.service';
import { ProfileService } from '../../../core/services/profile.service';
import { UserRole } from '../../../core/models/types';

@Component({
  selector: 'app-nav',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './nav.html',
})
export class NavComponent implements OnDestroy {
  readonly auth = inject(AuthService);
  private profileService = inject(ProfileService);
  readonly chatService = inject(ChatService);

  readonly isAuthenticated = this.auth.isAuthenticated;
  readonly role = signal<UserRole | null>(null);

  private inboxChannel: RealtimeChannel | null = null;

  constructor() {
    effect(async () => {
      const user = this.auth.user();
      if (!user) {
        this.role.set(null);
        this.chatService.unreadCount.set(0);
        if (this.inboxChannel) {
          this.chatService.unsubscribe(this.inboxChannel);
          this.inboxChannel = null;
        }
        return;
      }
      const profile = await this.profileService.getProfile(user.id);
      this.role.set(profile?.role ?? null);

      if (profile?.role === 'master') {
        await this.chatService.refreshUnreadCount(user.id);

        if (!this.inboxChannel) {
          this.inboxChannel = this.chatService.subscribeToInbox(user.id, () => {
            this.chatService.unreadCount.update(n => n + 1);
          });
        }
      }
    }, { allowSignalWrites: true });
  }

  ngOnDestroy() {
    if (this.inboxChannel) this.chatService.unsubscribe(this.inboxChannel);
  }

  async logout() {
    await this.auth.signOut();
  }
}
