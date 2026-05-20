import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import { AppConfigService } from './app-config.service';

export interface UserAuthority {
  authority: string;
}

export interface UserInfo {
  authorities: UserAuthority[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);
  private isAuthorizedSubject = new BehaviorSubject<boolean>(false);
  isAuthorized$ = this.isAuthorizedSubject.asObservable();

  getUserInfo(): Observable<UserInfo> {
    return this.http.get<UserInfo>(`${this.appConfig.apiBaseUrl}/user/info`);
  }

  get isAuthorized(): boolean {
    return this.isAuthorizedSubject.getValue();
  }

  setAuthorized(value: boolean): void {
    this.isAuthorizedSubject.next(value);
  }

  login(): void {
    const redirectUri = encodeURIComponent(window.location.href);
    window.location.href = `${this.appConfig.loginUrl}?redirect_uri=${redirectUri}`;
  }

  logout(): Observable<unknown> {
    return this.http.post(`${this.appConfig.logoutUrl}`, {});
  }

}
