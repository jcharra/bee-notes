import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { SplashScreen } from "@ionic-native/splash-screen/ngx";
import { StatusBar } from "@ionic-native/status-bar/ngx";
import { MenuController, Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "./pages/auth/auth.service";
import { Storage } from "@ionic/storage";

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
    private translate: TranslateService,
    private storage: Storage
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.splashScreen.show();

    this.storage.get("language").then((lang) => {
      this.translate.setDefaultLang(lang || "de");
      this.translate.use(lang || "de");
    });

    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();
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

  openSettings() {
    this.menu.close();
    this.router.navigateByUrl("/settings");
  }

  openAbout() {
    this.menu.close();
    this.router.navigateByUrl("/about");
  }
}
