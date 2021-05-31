import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { first } from "rxjs/operators";
import { PurchaseService } from "src/app/services/purchase.service";
import { Swarm } from "src/app/types/Swarm";
import { SwarmService } from "../../services/swarm.service";

@Component({
  selector: "app-excolonies",
  templateUrl: "./excolonies.page.html",
  styleUrls: ["./excolonies.page.scss"],
})
export class ExcoloniesPage {
  colonies: Swarm[];
  constructor(
    private swarmService: SwarmService,
    private router: Router,
    private alertCtrl: AlertController,
    private translate: TranslateService,
    private purchaseService: PurchaseService
  ) {}

  ionViewDidEnter() {
    this.swarmService
      .getFormerSwarms()
      .pipe(first())
      .subscribe((colonies: Swarm[]) => {
        this.colonies = colonies;
      });
  }

  reactivate(s: Swarm) {
    this.swarmService
      .getSwarms()
      .pipe(first())
      .subscribe(async (swarms: Swarm[]) => {
        console.log("Got ", swarms.length);
        if (
          this.purchaseService.checkLimitReached(swarms ? swarms.length : 0)
        ) {
          const alert = await this.alertCtrl.create({
            header: this.translate.instant(
              "COLONIES_PAGE.fullVersionRequiredDialogHeader"
            ),
            message: this.translate.instant(
              "COLONIES_PAGE.fullVersionRequiredDialogText"
            ),
            buttons: [
              {
                text: this.translate.instant("GENERAL.ok"),
                cssClass: "secondary",
              },
            ],
          });

          await alert.present();
        } else {
          const alert = await this.alertCtrl.create({
            header: this.translate.instant(
              "FORMER_COLONIES_PAGE.reactivationHint"
            ),
            buttons: [
              {
                text: this.translate.instant("GENERAL.cancel"),
                role: "cancel",
                cssClass: "secondary",
              },
              {
                text: this.translate.instant("GENERAL.yes"),
                handler: () => this._onReactivate(s),
              },
            ],
          });

          await alert.present();
        }
      });
  }

  private _onReactivate(s: Swarm) {
    this.swarmService
      .reactivate(s)
      .pipe(first())
      .subscribe(() => {
        this.router.navigateByUrl("/");
      });
  }

  viewJournal(s: Swarm) {
    this.router.navigateByUrl(`/swarms/view/${s.id}/journal?readonly=1`);
  }
}
