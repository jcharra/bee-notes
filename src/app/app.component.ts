import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { MenuController, Platform } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { AuthService } from "./pages/auth/auth.service";
import { StorageService } from "./services/storage.service";
import { SplashScreen } from "@capacitor/splash-screen";

@Component({
  selector: "app-root",
  templateUrl: "app.component.html",
  styleUrls: ["app.component.scss"],
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private authService: AuthService,
    private router: Router,
    private menu: MenuController,
    private translate: TranslateService,
    private storageService: StorageService
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      SplashScreen.hide();
    });

    setTimeout(() => {
      this.storageService.get("language").then((lang) => {
        this.translate.setDefaultLang(lang || "de");
        this.translate.use(lang || "de");
      });
    }, 200);
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
