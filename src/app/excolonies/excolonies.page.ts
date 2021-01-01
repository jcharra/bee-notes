import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { Observable } from "rxjs";
import { first } from "rxjs/operators";
import { Swarm, SwarmService } from "../swarm.service";

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
    private alertCtrl: AlertController
  ) {}

  ionViewDidEnter() {
    this.swarmService
      .getFormerSwarms()
      .pipe(first())
      .subscribe((colonies: Swarm[]) => {
        this.colonies = colonies;
      });
  }

  async reactivate(s: Swarm) {
    const alert = await this.alertCtrl.create({
      header: "Would you like to reactivate this swarm?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Yes",
          handler: () => this._onReactivate(s),
        },
      ],
    });

    await alert.present();
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
