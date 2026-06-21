import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class NotificationsService implements OnModuleInit {
  private readonly logger = new Logger(NotificationsService.name);
  private initialized = false;

  onModuleInit() {
    const keyPath = path.resolve(__dirname, '../../..', 'serviceAccountKey.json');
    if (!fs.existsSync(keyPath)) {
      this.logger.warn('serviceAccountKey.json not found — push notifications disabled');
      return;
    }
    try {
      admin.initializeApp({
        credential: admin.credential.cert(require(keyPath)),
      });
      this.initialized = true;
      this.logger.log('Firebase Admin initialized');
    } catch (e) {
      this.logger.error('Firebase Admin init failed', e);
    }
  }

  async sendToToken(token: string, title: string, body: string, data?: Record<string, string>) {
    if (!this.initialized || !token) return;
    try {
      await admin.messaging().send({
        token,
        notification: { title, body },
        data,
        android: { priority: 'high' },
      });
    } catch (e) {
      this.logger.warn(`FCM send failed: ${e}`);
    }
  }
}
