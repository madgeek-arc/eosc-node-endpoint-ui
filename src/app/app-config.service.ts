import { Injectable } from '@angular/core';

export interface RuntimeConfig {
  apiBaseUrl?: string;
  loginUrl?: string;
  logoutUrl?: string;
}

@Injectable({ providedIn: 'root' })
export class AppConfigService {
  private config: Required<RuntimeConfig> = {
    apiBaseUrl: '/api',
    loginUrl: '/api/oauth2/authorization/eosc',
    logoutUrl: '/api/logout'
  };

  async load(): Promise<void> {
    const response = await fetch('config.json');

    if (!response.ok) {
      throw new Error(`Could not load runtime config: ${response.status}`);
    }

    const runtimeConfig = await response.json() as RuntimeConfig;
    const apiBaseUrl = this.normalizeBaseUrl(runtimeConfig.apiBaseUrl ?? this.config.apiBaseUrl);

    this.config = {
      apiBaseUrl,
      loginUrl: runtimeConfig.loginUrl ?? `${apiBaseUrl}/oauth2/authorization/eosc`,
      logoutUrl: runtimeConfig.logoutUrl ?? `${apiBaseUrl}/logout`
    };
  }

  get apiBaseUrl(): string {
    return this.config.apiBaseUrl;
  }

  get loginUrl(): string {
    return this.config.loginUrl;
  }

  get logoutUrl(): string {
    return this.config.logoutUrl;
  }

  private normalizeBaseUrl(url: string): string {
    return url.replace(/\/$/, '');
  }
}
