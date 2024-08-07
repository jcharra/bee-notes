import { registerLocaleData } from "@angular/common";
import { HttpClient, HttpClientModule } from "@angular/common/http";
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
import { TranslateLoader, TranslateModule } from "@ngx-translate/core";
import { TranslateHttpLoader } from "@ngx-translate/http-loader";
import { environment } from "src/environments/environment";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

export function createTranslateLoader(http: HttpClient) {
  return new TranslateHttpLoader(http, "./assets/i18n/", ".json");
}

registerLocaleData(localeDe);
registerLocaleData(localeEn);
registerLocaleData(localeFr);
@NgModule({
  declarations: [AppComponent],
  imports: [
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
    BrowserModule,
    HttpClientModule,
    IonicModule.forRoot(),
    IonicStorageModule.forRoot({
      name: "__mydb",
      driverOrder: [Drivers.IndexedDB, Drivers.LocalStorage],
    }),
    AppRoutingModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: createTranslateLoader,
        deps: [HttpClient],
      },
    }),
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
    }),
  ],
  providers: [InAppPurchase2, Geolocation, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule {}
