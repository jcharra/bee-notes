import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  IonReorderGroup,
  LoadingController,
  NavController
} from "@ionic/angular";
import { ItemReorderEventDetail } from "@ionic/core";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin } from "rxjs";
import { first, switchMap, tap } from "rxjs/operators";
import { PurchaseService } from "src/app/purchase.service";
import { JournalService } from "src/app/services/journal.service";
import { StatusService } from "src/app/services/status.service";
import {
  SwarmGroup, SwarmGroupService
} from "src/app/services/swarm-group.service";
import { SwarmService } from "src/app/services/swarm.service";
import { JournalEntry } from "src/app/types/JournalEntry";
import { Swarm } from "src/app/types/Swarm";

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
  sortedSwarmGroups: UISwarmGroup[] = null;
  swarms: Swarm[];
  userId: string;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  translation: any;

  DEFAULT_GROUP_NAME = "";

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private navController: NavController,
    private statusService: StatusService,
    private swarmGroupService: SwarmGroupService,
    private translate: TranslateService,
    private purchases: PurchaseService
  ) {
    this.DEFAULT_GROUP_NAME = this.translate.instant(
      "COLONIES_PAGE.defaultGroupName"
    );
  }

  async loadSwarms() {
    const showSpinner = !this.swarms;
    const loading = await this.loadingController.create({
      message: this.translate.instant("COLONIES_PAGE.loading"),
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
              .getEntries(sw.id, { limit: 6 })
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
          }
        });

        displayGroups.push(displayGroup);
      });

      this.sortedSwarmGroups = displayGroups;
    });
  }

  ionViewDidEnter() {
    this.loadSwarms();
  }

  openSwarmDetail(swarmId: string) {
    this.navController.navigateForward("/swarms/view/" + swarmId);
  }

  async editSwarmGroup(existing?: UISwarmGroup) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant(
        existing
          ? "COLONIES_PAGE.editGroupName"
          : "COLONIES_PAGE.newColonyGroup"
      ),
      inputs: [
        {
          name: "name",
          type: "text",
          value: existing?.name,
          placeholder: this.translate.instant("COLONIES_PAGE.namePlaceholder"),
        },
      ],
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: existing
            ? this.translate.instant("GENERAL.save")
            : this.translate.instant("COLONIES_PAGE.createGroup"),
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
              this.onCreationFailure(
                this.translate.instant("COLONIES_PAGE.chooseValidName")
              );
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
    if (this.purchases.checkLimitReached(this.swarms.length)) {
      this.requireFullVersion();
      return
    }

    const alert = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.newColony"),
      inputs: [
        {
          name: "name",
          type: "text",
          placeholder: this.translate.instant("COLONIES_PAGE.namePlaceholder"),
        },
      ],
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("COLONIES_PAGE.addColony"),
          handler: (value) => {
            const name = value.name.trim();
            if (name) {
              this.swarmService
                .createSwarm(name)
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
              this.onCreationFailure(
                this.translate.instant("COLONIES_PAGE.chooseValidName")
              );
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
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.createGroupFailed"),
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

    // A list of items that must correspond exactly to the UI list (including group headings!)
    let flatItems = [];
    this.sortedSwarmGroups.forEach((g) => {
      flatItems.push(g);
      g.swarms.forEach((s) => {
        flatItems.push(s);
      });
    });

    const draggedItem: Swarm = flatItems[fromIdx];

    let fromGroup: UISwarmGroup;
    for (let i = fromIdx; i >= 0; i--) {
      if (flatItems[i].swarms) {
        fromGroup = flatItems[i];
        break;
      }
    }

    const oneOffset = fromIdx > toIdx ? 1 : 0;

    let toGroup: UISwarmGroup;
    for (let i = toIdx - oneOffset; i >= 0; i--) {
      if (flatItems[i].swarms) {
        toGroup = flatItems[i];
        break;
      }
    }

    const loading = await this.loadingController.create({
      message: this.translate.instant("COLONIES_PAGE.updatingSpinner"),
      showBackdrop: true,
    });
    loading.present();

    ev.detail.complete();

    // ID at target index. If it is a group heading, set to null
    const targetId = flatItems[toIdx].swarms ? null : flatItems[toIdx].id;

    fromGroup.swarms = fromGroup.swarms.filter(
      (s: Swarm) => s.id !== draggedItem.id
    );

    if (!targetId) {
      oneOffset
        ? toGroup.swarms.push(draggedItem)
        : toGroup.swarms.unshift(draggedItem);
    } else {
      const insertIdx = toGroup.swarms.map((s) => s.id).indexOf(targetId) || 0;
      toGroup.swarms.splice(insertIdx - oneOffset + 1, 0, draggedItem);
    }

    const reindexRequests = [];

    reindexRequests.push(
      this.swarmGroupService.updateGroup({
        id: toGroup.id,
        name: toGroup.name,
        swarmIds: toGroup.swarms.map((s) => s.id),
      })
    );

    if (fromGroup !== toGroup) {
      reindexRequests.push(
        this.swarmGroupService.updateGroup({
          id: fromGroup.id,
          name: fromGroup.name,
          swarmIds: fromGroup.swarms.map((s) => s.id),
        })
      );
    }

    forkJoin(reindexRequests).subscribe(() => {
      this.loadSwarms().then(() => {
        loading.dismiss();
      });
    });
  }

  reindexGroup(group: UISwarmGroup) {
    return this.swarmGroupService.updateGroup({
      id: group.id,
      name: group.name,
      swarmIds: group.swarms.map((s) => s.id),
    });
  }

  deleteGroup(gid: string) {
    this.swarmGroupService.deleteGroup(gid).subscribe(() => {
      this.loadSwarms();
    });
  }

  async requireFullVersion() {
    const hint = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.fullVersionRequiredDialogHeader"),
      message: this.translate.instant("COLONIES_PAGE.fullVersionRequiredDialogText"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.ok")
        }
      ]
    });

    hint.present();
  }
}
