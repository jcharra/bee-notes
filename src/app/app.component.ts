import { AuthService } from './auth/auth.service';
import { Component, OnDestroy, OnInit } from '@angular/core';

import { MenuController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { AppState, Plugins } from '@capacitor/core';
import { take } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  private authSub: Subscription;
  private previousAuthState = false;

  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authService: AuthService,
    private router: Router,
    private menu: MenuController,
    private translate: TranslateService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
      this.translate.setDefaultLang('de'); 
    });
  }

  ngOnInit() {
    this.authSub = this.authService.userIsAuthenticated.subscribe(
      isAuthenticated => {
        if (!isAuthenticated && this.previousAuthState != isAuthenticated) {
          this.router.navigateByUrl('/auth');
        }
        this.previousAuthState = isAuthenticated;
      }
    );

    Plugins.App.addListener('appStateChange', this.checkAuthOnResume.bind(this));
  }

  ngOnDestroy() {
    if (this.authSub) {
      this.authSub.unsubscribe();
    }
  }

  onLogout() {
    this.menu.close();
    this.authService.logout();
  }

  openFinance() {
    this.menu.close();
    this.router.navigateByUrl('/finance');
  }

  openSwarms() {
    this.menu.close();
    this.router.navigateByUrl('/swarms');
  }

  private checkAuthOnResume(state: AppState) {
    if (state.isActive) {
      this.authService
        .autoLogin()
        .pipe(take(1))
        .subscribe(success => {
          if (!success) {
            this.onLogout();
          }
        });
    }
  }
}
