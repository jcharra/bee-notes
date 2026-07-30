import { AuthService } from './../pages/auth/auth.service';
import { Component, OnInit } from '@angular/core';

@Component({
    selector: 'app-accountdeletion',
    templateUrl: './accountdeletion.page.html',
    styleUrls: ['./accountdeletion.page.scss'],
    standalone: false
})
export class AccountdeletionPage implements OnInit {
  password: string;

  constructor(private authService: AuthService) { }

  ngOnInit() {
  }

  deleteAccount() {
    this.authService.deleteUser(this.password);
  }
}
