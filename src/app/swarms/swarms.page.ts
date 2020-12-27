import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  IonReorderGroup,
  LoadingController,
  NavController,
} from "@ionic/angular";
import { ItemReorderEventDetail } from "@ionic/core";
import { from, Observable } from "rxjs";
import { forkJoin, of } from "rxjs";
import { first, switchMap, tap } from "rxjs/operators";
import { JournalEntry, JournalService } from "../journal.service";
import { StatusService } from "../status.service";
import { SwarmGroup, SwarmGroupService } from "../swarm-group.service";
import { Swarm, SwarmService } from "../swarm.service";

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
  DEFAULT_GROUP_NAME = "Unnamed group";

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
      let swarmsById = new Map<string, Swarm>();
      this.swarms.forEach((s) => {
        swarmsById.set(s.id, s);
      });

      let displayGroups: UISwarmGroup[] = [];

      groups.forEach((g) => {
        let displayGroup: UISwarmGroup = {
          id: g.id,
          name: g.name,
          swarms: [],
        };

        (g.swarmIds || []).forEach((sid) => {
          const swarm = swarmsById.get(sid);
          if (swarm) {
            displayGroup.swarms.push(swarm);
            swarmsById.delete(sid);
          }
        });

        displayGroup.swarms.sort(this._sortByIndex);
        displayGroups.push(displayGroup);
      });

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
                sortIndex: 0,
              };

              this.swarmService
                .createSwarm(newSwarm)
                .pipe(
                  switchMap((swarmId) => {
                    if (this.sortedSwarmGroups.length === 0) {
                      return this.swarmGroupService.createGroup(
                        this.DEFAULT_GROUP_NAME,
                        [swarmId]
                      );
                    } else {
                      const lastGroup = this.sortedSwarmGroups[
                        this.sortedSwarmGroups.length - 1
                      ];
                      const swarmIds = lastGroup.swarms.map((s) => s.id);
                      swarmIds.push(swarmId);
                      return this.swarmGroupService.updateGroup({
                        id: lastGroup.id,
                        name: lastGroup.name,
                        swarmIds,
                      });
                    }
                  })
                )
                .subscribe(
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

  async doReorder(ev: CustomEvent<ItemReorderEventDetail>) {
    const fromIdx = ev.detail.from;
    const toIdx = ev.detail.to;

    // Moving to idx 1 is not allowed (above first heading)
    if (toIdx === 0) {
      ev.detail.complete();
      this.loadSwarms();
      return;
    }

    let flatItems = [];
    this.sortedSwarmGroups.forEach((g) => {
      flatItems.push(g);
      g.swarms.forEach((s) => {
        flatItems.push(s);
      });
    });

    const draggedItem = flatItems[fromIdx];

    let fromGroup;
    for (let i = fromIdx; i >= 0; i--) {
      if (flatItems[i].swarms) {
        fromGroup = flatItems[i];
        break;
      }
    }

    let toGroup;
    for (let i = toIdx - (fromIdx > toIdx ? 1 : 0); i >= 0; i--) {
      if (flatItems[i].swarms) {
        toGroup = flatItems[i];
        break;
      }
    }

    let requests = [];
    if (fromGroup.id !== toGroup.id) {
      this.sortedSwarmGroups.forEach((g) => {
        if (g.id === fromGroup.id) {
          g.swarms = g.swarms.filter((s) => s.id !== draggedItem.id);

          requests.push(
            this.swarmGroupService.updateGroup({
              id: g.id,
              name: g.name,
              swarmIds: g.swarms.map((s) => s.id),
            })
          );
        } else if (g.id === toGroup.id) {
          g.swarms.push(draggedItem);

          requests.push(
            this.swarmGroupService.updateGroup({
              id: g.id,
              name: g.name,
              swarmIds: g.swarms.map((s) => s.id),
            })
          );
        }
      });
    }

    // Iterate forward and backward to get all items in group
    const successorsInFinalGroup: Swarm[] = [];
    for (let t = toIdx + (toIdx > fromIdx ? 1 : 0); t < flatItems.length; t++) {
      if (flatItems[t].swarms) {
        break;
      }
      successorsInFinalGroup.push(flatItems[t]);
    }

    if (successorsInFinalGroup.length === 0) {
      const maxIndex = Math.max(...toGroup.swarms.map((s) => s.sortIndex));
      draggedItem.sortIndex = maxIndex + 1000;
      requests.push(this.swarmService.updateSwarm(draggedItem));
    } else {
      const newIndex = successorsInFinalGroup[0].sortIndex;
      draggedItem.sortIndex = newIndex;
      requests.push(this.swarmService.updateSwarm(draggedItem));

      if (successorsInFinalGroup.length === 1) {
        successorsInFinalGroup[0].sortIndex = newIndex + 1000;
      } else {
        successorsInFinalGroup[0].sortIndex = Math.ceil(
          (newIndex + successorsInFinalGroup[1].sortIndex) / 2
        );
      }
      requests.push(this.swarmService.updateSwarm(successorsInFinalGroup[0]));
    }

    ev.detail.complete();

    const loading = await this.loadingController.create({
      message: "Updating ...",
      showBackdrop: true,
    });

    loading.present();

    forkJoin(requests).subscribe(() => {
      this.loadSwarms().then(() => {
        loading.dismiss();
      });
    });
  }

  deleteGroup(gid: string) {
    this.swarmGroupService.deleteGroup(gid).subscribe(() => {
      this.loadSwarms();
    });
  }

  _sortByIndex(a: Swarm, b: Swarm) {
    const ka = a.sortIndex;
    const kb = b.sortIndex;

    if (ka < kb) {
      return -1;
    } else if (ka > kb) {
      return 1;
    }

    return 0;
  }
}
