import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private isAuthorizedSubject = new BehaviorSubject<boolean>(false);
  isAuthorized$ = this.isAuthorizedSubject.asObservable();

  constructor(private http: HttpClient) {}

  getUserInfo(): Observable<any> {
    return this.http.get(`${environment.API_ENDPOINT}/user/info`);
  }

  get isAuthorized(): boolean {
    return this.isAuthorizedSubject.getValue();
  }

  setAuthorized(value: boolean): void {
    this.isAuthorizedSubject.next(value);
  }

  login(): void {
    const redirectUri = encodeURIComponent(window.location.origin);
    window.location.href = `${environment.API_LOGIN}?redirect_uri=${redirectUri}`;
  }

  logout(): Observable<any> {
    return this.http.post(`${environment.API_LOGOUT}`, {});
  }

}
