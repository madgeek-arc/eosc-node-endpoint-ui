import { Component } from '@angular/core';
import {AuthService} from './authentication.service.component';

@Component({
  selector: 'app-root',
  standalone: false,
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {

  isLoggedIn = false;

  constructor(protected authService: AuthService) {}

  ngOnInit() {
    this.checkAuth();
  }

  checkAuth() {
    this.authService.getUserInfo().subscribe({
      next: (res) => {
        this.isLoggedIn = true;
        if (res.authorities.some((a: any) => a.authority === 'ADMIN')) this.authService.setAuthorized(true);
      },
      error: () => {
        this.isLoggedIn = false;
      }
    });
  }

  login() {
    this.authService.login();
  }

  logout() {
    this.authService.logout().subscribe({
      next: () => {
        this.isLoggedIn = false;
        this.authService.setAuthorized(false);
      },
      error: () => {
        // force logout on client side even if call fails
        this.isLoggedIn = false;
        this.authService.setAuthorized(false);
      }
    });
  }
}
