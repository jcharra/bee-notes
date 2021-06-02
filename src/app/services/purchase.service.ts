import { ChangeDetectorRef, Injectable } from "@angular/core";
import {
  IAPProduct,
  InAppPurchase2,
} from "@ionic-native/in-app-purchase-2/ngx";
import { Platform, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";

export const DEV_COFFEE = "devcoffee";
export const FULL_VERSION = "beenotesfullversion";
const MAX_SWARMS_FREE_VERSION = 3;

@Injectable({
  providedIn: "root",
})
export class PurchaseService {
  hasFullVersion: boolean;
  purchasesAvailable: boolean;
  private products: IAPProduct[] = [];

  constructor(
    private plt: Platform,
    private store: InAppPurchase2,
    private toastCtrl: ToastController,
    private translate: TranslateService
  ) {
    this.plt.ready().then(() => {
      if (!this.plt.is("ios") && !this.plt.is("android")) {
        this.purchasesAvailable = false;
        return;
      }
      this.registerProducts();
      this.setupListeners();

      this.store.refresh();

      this.store.ready(() => {
        this.products = this.store.products;
        this.purchasesAvailable = this.products.length > 0;
      });
    });
  }

  registerProducts() {
    this.store.register({
      id: FULL_VERSION,
      type: this.store.NON_CONSUMABLE,
    });

    this.store.register({
      id: DEV_COFFEE,
      type: this.store.CONSUMABLE,
    });
  }

  setupListeners() {
    this.store
      .when("product")
      .approved((p: IAPProduct) => {
        if (p.id === FULL_VERSION) {
          this.hasFullVersion = true;
        } else if (p.id === DEV_COFFEE) {
          this.sayThanks();
        }

        p.verify();
      })
      .verified((p: IAPProduct) => {
        p.finish();
      });

    this.store.when(FULL_VERSION).owned((p: IAPProduct) => {
      this.hasFullVersion = true;
    });
  }

  refresh() {
    this.store.refresh();
  }

  purchase(prod_id: string): Promise<void> {
    return this.store.order(prod_id).then(
      () => {},
      (e) => {
        this.onPurchaseFailure(prod_id, e);
      }
    );
  }

  purchaseFullVersion(): Promise<void> {
    if (!this.products || this.products.length === 0) {
      console.error("No products available");
      return Promise.reject();
    }

    return this.purchase(FULL_VERSION);
  }

  purchaseCoffee(): Promise<void> {
    if (!this.products || this.products.length === 0) {
      console.error("No products available");
      return Promise.reject();
    }

    return this.purchase(DEV_COFFEE);
  }

  async onPurchaseFailure(pid: string, err: any) {
    const toast = await this.toastCtrl.create({
      message: this.translate.instant("PURCHASES.purchaseFailure", {
        id: pid,
        err,
      }),
      duration: 4000,
    });

    toast.present();
  }

  async onPurchaseSuccess(p: IAPProduct) {
    const toast = await this.toastCtrl.create({
      message: this.translate.instant("PURCHASES.purchaseSuccess", {
        id: p.id,
      }),
      duration: 4000,
    });

    toast.present();
  }

  async sayThanks() {
    const toast = await this.toastCtrl.create({
      message: this.translate.instant("PURCHASES.devCoffeeThankYou"),
      duration: 6000,
    });
    toast.present();
  }

  checkLimitReached(numSwarms: number) {
    return (
      (this.plt.is("android") || this.plt.is("ios")) &&
      !this.hasFullVersion &&
      numSwarms >= MAX_SWARMS_FREE_VERSION
    );
  }
}
