import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { MenuController, Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "./auth/auth.service";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
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
      this.translate.setDefaultLang("en");
    });
  }

  onLogout() {
    this.menu.close();
    this.authService.logout();
    this.router.navigateByUrl("/auth");
  }

  openFinance() {
    this.menu.close();
    this.router.navigateByUrl("/finance");
  }

  openFormerColonies() {
    this.menu.close();
    this.router.navigateByUrl("/excolonies");
  }

  openSwarms() {
    this.menu.close();
    this.router.navigateByUrl("/swarms");
  }
}
