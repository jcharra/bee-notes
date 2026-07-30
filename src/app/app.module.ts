import { registerLocaleData } from "@angular/common";
import { provideHttpClient, withInterceptorsFromDi } from "@angular/common/http";
import localeDe from "@angular/common/locales/de";
import localeEn from "@angular/common/locales/en";
import localeFr from "@angular/common/locales/fr";
import { NgModule } from "@angular/core";
import { getApp, initializeApp, provideFirebaseApp } from "@angular/fire/app";
import {
  browserSessionPersistence,
  getAuth,
  indexedDBLocalPersistence,
  initializeAuth,
  provideAuth,
} from "@angular/fire/auth";
import { getDatabase, provideDatabase } from "@angular/fire/database";
import { BrowserModule } from "@angular/platform-browser";
import { RouteReuseStrategy } from "@angular/router";
import { ServiceWorkerModule } from "@angular/service-worker";
import { Capacitor } from "@capacitor/core";
import { Geolocation } from "@awesome-cordova-plugins/geolocation/ngx";
import { InAppPurchase2 } from "@awesome-cordova-plugins/in-app-purchase-2/ngx";
import { IonicModule, IonicRouteStrategy } from "@ionic/angular";
import { Drivers } from "@ionic/storage";
import { IonicStorageModule } from "@ionic/storage-angular";
import { provideTranslateService, TranslatePipe } from "@ngx-translate/core";
import { provideTranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from "src/environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

registerLocaleData(localeDe);
registerLocaleData(localeEn);
registerLocaleData(localeFr);
@NgModule({
  declarations: [AppComponent],
  bootstrap: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: "__mydb",
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    AppRoutingModule,
    TranslatePipe,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  providers: [
    InAppPurchase2,
    Geolocation,
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    provideHttpClient(withInterceptorsFromDi()),
    provideTranslateService({
      loader: provideTranslateHttpLoader({ prefix: "./assets/i18n/", suffix: ".json" }),
    }),
    provideFirebaseApp(() => initializeApp(environment.firebaseConfig)),
    provideDatabase(() => getDatabase(getApp())),
    provideAuth(() => {
      if (Capacitor.isNativePlatform()) {
        console.log("NATIVE auth");
        return initializeAuth(getApp(), {
          persistence: indexedDBLocalPersistence,
        });
      } else {
        console.log("WEB auth");
        const auth = getAuth();
        auth.setPersistence(browserSessionPersistence);
        return auth;
      }
    }),
  ],
})
export class AppModule {}
