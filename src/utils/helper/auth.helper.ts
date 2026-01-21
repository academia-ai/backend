import { Global, Injectable } from '@nestjs/common';
import { Response } from 'express';

@Global()
@Injectable()
export class AuthHelper {
  parseExpiryToMs(expiry: string): number {
    const unit = expiry.slice(-1);
    const value = parseInt(expiry.slice(0, -1));

    switch (unit) {
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return 7 * 24 * 60 * 60 * 1000; // Default to 7 days
    }
  }

  parseExpiryToCookie(expiry: string): number {
    const unit = expiry.slice(-1); // Get the last character (unit)
    const value = parseInt(expiry.slice(0, -1)); // Get the numeric part of expiry

    if (isNaN(value)) {
      throw new Error('Invalid expiry value');
    }

    switch (unit) {
      case 'm':
        return value * 60 * 1000; // Minutes to milliseconds
      case 'h':
        return value * 60 * 60 * 1000; // Hours to milliseconds
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        throw new Error(`Invalid expiry unit: ${unit}`);
    }
  }

  // ✅ Set authentication cookie
  setAuthCookie(res: Response, name: string, value: string, expiry: string) {
    try {
      const maxAge = this.parseExpiryToMs(expiry);

      const isLive = process.env.ENVIRONMENT === 'LIVE';
      const domain =
        isLive && process.env.PLATFORM_DOMAIN
          ? process.env.PLATFORM_DOMAIN
          : undefined;

      res.cookie(name, value, {
        httpOnly: true,
        //secure: !!domain, // Secure true in prod (over HTTPS)
        secure: true,
        //sameSite: domain ? 'none' : 'lax', // 'none' for cross-site, 'lax' for dev
        sameSite: 'none',
        maxAge,
        domain, // Only set in prod
        path: '/',
      });

      console.log(`✅ Cookie "${name}" set successfully`);
    } catch (error: any) {
      console.error('❌ Error setting cookie:', error);
    }
  }
}
