import { Component } from "@angular/core";
import {
  AlertController,
  LoadingController,
  NavController,
} from "@ionic/angular";
import { formatDistance } from "date-fns";
import { first, tap } from "rxjs/operators";
import { JournalEntry, JournalService } from "../journal.service";
import { StatusService } from "../status.service";
import { Swarm, SwarmService, GeoPosition } from "../swarm.service";

export interface SwarmGroup {
  position: GeoPosition;
  swarms: Swarm[];
}

@Component({
  selector: "app-swarms",
  templateUrl: "./swarms.page.html",
  styleUrls: ["./swarms.page.scss"],
})
export class SwarmsPage {
  swarmGroups: SwarmGroup[] = [];
  swarms: Swarm[];
  userId: string;

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private navController: NavController,
    private alertController: AlertController,
    private statusService: StatusService
  ) {}

  async loadSwarms() {
    const showSpinner = !this.swarms;
    const loading = await this.loadingController.create({
      message: "Loading colonies ...",
      showBackdrop: true,
    });

    if (showSpinner) {
      await loading.present();
    }

    this.swarmService
      .getSwarms()
      .pipe(
        first(),
        tap((s: Swarm[]) => {
          // only reassign if length has changed (avoids flickering)
          this.swarms =
            this.swarms && this.swarms.length === s.length ? this.swarms : s;

          this.swarms.forEach((sw: Swarm) => {
            this.journalService
              .getEntries(sw.id, 6)
              .subscribe((e: JournalEntry[]) => {
                if (e && e.length > 0) {
                  sw.lastAction = e[0];
                  sw.statusInfo = this.statusService.getColonyStatus(e);
                }
              });

            this.groupSwarms();
          });

          showSpinner && loading.dismiss();
        })
      )
      .subscribe();
  }

  groupSwarms() {
    let groups: SwarmGroup[] = [];
    let groupWithUnknownPosition: SwarmGroup = {
      position: {
        lat: 0,
        lng: 0,
        displayName: "Unknown location",
      },
      swarms: [],
    };

    this.swarms.forEach((s) => {
      if (!s.position) {
        groupWithUnknownPosition.swarms.push(s);
      } else {
        let inserted = false;
        groups.forEach((g) => {
          if (this._distance(g.position, s.position) < 0.2) {
            g.swarms.push(s);
            inserted = true;
          }
        });

        if (!inserted) {
          const groupPosition = s.position;
          groupPosition.displayName = s.position.displayName
            ? s.position.displayName
            : `Lat ${s.position.lat} Lng ${s.position.lng}`;

          groups.push({
            position: s.position,
            swarms: [s],
          });
        }
      }
    });

    if (groupWithUnknownPosition.swarms.length > 0) {
      groups.push(groupWithUnknownPosition);
    }

    this.swarmGroups = groups;
  }

  _distance(p1: GeoPosition, p2: GeoPosition) {
    return Math.sqrt(
      Math.pow(p1.lat - p2.lat, 2) + Math.pow(p1.lng - p2.lng, 2)
    );
  }

  migrate() {
    // put migrations here
  }

  ionViewDidEnter() {
    this.loadSwarms();
  }

  openSwarmDetail(swarmId: string) {
    this.navController.navigateForward("/swarms/view/" + swarmId);
  }

  async createSwarm() {
    const alert = await this.alertCtrl.create({
      header: "New colony",
      message: "Give your colony a name",
      inputs: [
        {
          name: "name",
          type: "text",
          placeholder: "Choose name",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Add colony",
          handler: (value) => {
            const name = value.name.trim();
            if (name) {
              let newSwarm: Swarm = {
                name: value.name.trim(),
                created: new Date(),
              };

              this.swarmService.createSwarm(newSwarm).subscribe(
                () => {
                  this.loadSwarms();
                },
                (err) => {
                  this.onCreationFailure(err);
                }
              );
            } else {
              this.onCreationFailure("Please choose a valid name");
            }
          },
        },
      ],
    });

    await alert.present().then(() => {
      const el: any = document.querySelector("ion-alert input");
      el.focus();
    });
  }

  async onCreationFailure(msg: string) {
    const alert = await this.alertController.create({
      header: "Creation failed",
      message: msg,
      buttons: ["OK"],
    });

    await alert.present();
  }
}
