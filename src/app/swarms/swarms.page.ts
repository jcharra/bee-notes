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
const DEFAULT_SORT_INDEX = 0;

interface UISwarmGroup {
  id: string;
  name: string;
  swarms: Swarm[];
}

@Component({
  selector: "app-swarms",
  templateUrl: "./swarms.page.html",
  styleUrls: ["./swarms.page.scss"],
})
export class SwarmsPage {
  sortedSwarmGroups: UISwarmGroup[] = [];
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

      let displayGroups: UISwarmGroup[] = [];

      groups.forEach((g) => {
        let displayGroup: UISwarmGroup = {
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

        displayGroup.swarms.sort(this._sortByIndex);

        displayGroups.push(displayGroup);
      });

      if (swarmsNotAppearingInGroup.size > 0) {
        const ungrouped: UISwarmGroup = {
          id: UNASSIGNED_GROUP,
          name: "Unknown location",
          swarms: [],
        };

        for (let swarm of swarmsNotAppearingInGroup.values()) {
          ungrouped.swarms.push(swarm);
        }

        ungrouped.swarms.sort(this._sortByIndex);

        displayGroups.push(ungrouped);
      }

      this.sortedSwarmGroups = displayGroups;
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

  async editSwarmGroup(existing: UISwarmGroup) {
    const alert = await this.alertCtrl.create({
      header: existing ? "Edit group name" : "New colony group",
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
          text: existing ? "Save" : "Create group",
          handler: (value) => {
            const name = value.name.trim();
            if (name) {
              let action;
              if (existing) {
                action = this.swarmGroupService.updateGroup({
                  id: existing.id,
                  name,
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

  _sortByIndex(a: Swarm, b: Swarm) {
    const ka = a.sortIndex || DEFAULT_SORT_INDEX;
    const kb = b.sortIndex || DEFAULT_SORT_INDEX;

    if (ka < kb) {
      return -1;
    } else if (ka > kb) {
      return 1;
    }

    return 0;
  }
}
