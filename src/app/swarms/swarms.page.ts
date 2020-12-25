import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  IonReorderGroup,
  LoadingController,
  NavController,
} from "@ionic/angular";
import { ItemReorderEventDetail } from "@ionic/core";
import { first, tap } from "rxjs/operators";
import { JournalEntry, JournalService } from "../journal.service";
import { StatusService } from "../status.service";
import { SwarmGroup, SwarmGroupService } from "../swarm-group.service";
import { Swarm, SwarmService } from "../swarm.service";

const UNASSIGNED_GROUP = "foo";
interface DisplayGroup {
  id?: string;
  name: string;
  swarms: Swarm[];
}

@Component({
  selector: "app-swarms",
  templateUrl: "./swarms.page.html",
  styleUrls: ["./swarms.page.scss"],
})
export class SwarmsPage {
  swarmGroups: DisplayGroup[] = [];
  swarms: Swarm[];
  userId: string;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private navController: NavController,
    private alertController: AlertController,
    private statusService: StatusService,
    private swarmGroupService: SwarmGroupService
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
          });

          this.groupSwarms();

          showSpinner && loading.dismiss();
        })
      )
      .subscribe();
  }

  groupSwarms() {
    this.swarmGroupService.getGroups().subscribe((groups: SwarmGroup[]) => {
      let swarmsNotAppearingInGroup = new Map<string, Swarm>();
      this.swarms.forEach((s) => {
        swarmsNotAppearingInGroup.set(s.id, s);
      });

      let displayGroups: DisplayGroup[] = [];

      groups.forEach((g) => {
        let displayGroup: DisplayGroup = {
          id: g.id,
          name: g.name,
          swarms: [],
        };

        (g.swarmIds || []).forEach((sid) => {
          const swarm = swarmsNotAppearingInGroup.get(sid);
          if (swarm) {
            displayGroup.swarms.push(swarm);
            swarmsNotAppearingInGroup.delete(sid);
          }
        });

        displayGroups.push(displayGroup);
      });

      if (swarmsNotAppearingInGroup.size > 0) {
        const ungrouped = {
          name: "Unknown location",
          swarms: [],
        };

        for (let entry of swarmsNotAppearingInGroup.values()) {
          ungrouped.swarms.push(entry);
        }

        displayGroups.push(ungrouped);
      }

      this.swarmGroups = displayGroups;
    });
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

  async editSwarmGroup(existing: DisplayGroup) {
    const alert = await this.alertCtrl.create({
      header: existing ? "Edit colony group" : "New colony group",
      inputs: [
        {
          name: "name",
          type: "text",
          value: existing?.name,
          placeholder: "Pick a name",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: existing ? "Save changes" : "Create group",
          handler: (value) => {
            const name = value.name.trim();
            if (name) {
              let action;
              if (existing) {
                existing.name = name;
                action = this.swarmGroupService.updateGroup({
                  id: existing.id,
                  name: existing.name,
                  swarmIds: existing.swarms.map((s) => s.id),
                });
              } else {
                action = this.swarmGroupService.createGroup(name);
              }

              action.subscribe(
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

  async createSwarm() {
    const alert = await this.alertCtrl.create({
      header: "New colony",
      inputs: [
        {
          name: "name",
          type: "text",
          placeholder: "Pick a name",
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

  doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    // The `from` and `to` properties contain the index of the item
    // when the drag started and ended, respectively
    console.log("Dragged from index", ev.detail.from, "to", ev.detail.to);

    // Finish the reorder and position the item in the DOM based on
    // where the gesture ended. This method can also be called directly
    // by the reorder group
    ev.detail.complete();
  }
}
