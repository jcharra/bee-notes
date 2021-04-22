import { Component, ViewChild } from "@angular/core";
import {
  AlertController,
  IonReorderGroup,
  LoadingController,
  NavController,
} from "@ionic/angular";
import { ItemReorderEventDetail } from "@ionic/core";
import { TranslateService } from "@ngx-translate/core";
import { first, switchMap, tap } from "rxjs/operators";
import { PurchaseService } from "src/app/purchase.service";
import { JournalService } from "src/app/services/journal.service";
import { StatusService } from "src/app/services/status.service";
import {
  SwarmGroup,
  SwarmGroupService,
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

  async editSwarmGroup(groupId?: string) {
    const existing =
      groupId && this.sortedSwarmGroups.filter((g) => g.id === groupId)[0];
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

  async createSwarm(groupId: string) {
    if (this.purchases.checkLimitReached(this.swarms.length)) {
      this.requireFullVersion();
      return;
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
                  first(),
                  switchMap((swarmId) => {
                    const group = this.sortedSwarmGroups.filter(
                      (g) => g.id === groupId
                    );
                    const groupToAdd = group.length
                      ? group[0]
                      : this.sortedSwarmGroups[
                          this.sortedSwarmGroups.length - 1
                        ];
                    const swarmIds = groupToAdd.swarms.map((s) => s.id);
                    swarmIds.push(swarmId);
                    return this.swarmGroupService.updateGroup({
                      id: groupToAdd.id,
                      name: groupToAdd.name,
                      swarmIds,
                    });
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

  async doReorder(ev: CustomEvent<ItemReorderEventDetail>, groupIdx: number) {
    const fromIdx = ev.detail.from;
    const toIdx = ev.detail.to;

    const group = this.sortedSwarmGroups[groupIdx];

    if (fromIdx > toIdx) {
      group.swarms.splice(toIdx, 0, group.swarms[fromIdx]);
      group.swarms.splice(fromIdx + 1, 1);
    } else {
      group.swarms.splice(toIdx + 1, 0, group.swarms[fromIdx]);
      group.swarms.splice(fromIdx, 1);
    }
    ev.detail.complete();

    const loading = await this.loadingController.create({
      message: this.translate.instant("COLONIES_PAGE.updatingSpinner"),
      showBackdrop: true,
    });
    await loading.present();

    this.swarmGroupService
      .updateGroup({
        id: group.id,
        name: group.name,
        swarmIds: group.swarms.map((s) => s.id),
      })
      .subscribe(() => {
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

  async requireFullVersion() {
    const hint = await this.alertCtrl.create({
      header: this.translate.instant(
        "COLONIES_PAGE.fullVersionRequiredDialogHeader"
      ),
      message: this.translate.instant(
        "COLONIES_PAGE.fullVersionRequiredDialogText"
      ),
      buttons: [
        {
          text: this.translate.instant("GENERAL.ok"),
        },
      ],
    });

    hint.present();
  }
}
