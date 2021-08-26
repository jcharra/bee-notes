import { Component, ViewChild } from "@angular/core";
import { Router } from "@angular/router";
import {
  AlertController,
  IonReorderGroup,
  LoadingController,
} from "@ionic/angular";
import { ItemReorderEventDetail } from "@ionic/core";
import { TranslateService } from "@ngx-translate/core";
import { differenceInMilliseconds } from "date-fns";
import { empty, forkJoin, Observable, of } from "rxjs";
import { first, map, switchMap, tap } from "rxjs/operators";
import { AnimationService } from "src/app/services/animation.service";
import { AppreviewService } from "src/app/services/appreview.service";
import { JournalService } from "src/app/services/journal.service";
import { PurchaseService } from "src/app/services/purchase.service";
import { StatusService } from "src/app/services/status.service";
import {
  LocalStorageKey,
  StorageSyncService,
} from "src/app/services/storage-sync.service";
import {
  SwarmGroup,
  SwarmGroupService,
} from "src/app/services/swarm-group.service";
import { SwarmService } from "src/app/services/swarm.service";
import { JournalEntry } from "src/app/types/JournalEntry";
import { Swarm } from "src/app/types/Swarm";

export interface UISwarmGroup {
  id: string;
  name: string;
  swarms: Swarm[];
  lat?: number;
  lng?: number;
}

@Component({
  selector: "app-swarms",
  templateUrl: "./swarms.page.html",
  styleUrls: ["./swarms.page.scss"],
})
export class SwarmsPage {
  sortedSwarmGroups: UISwarmGroup[] = null;
  userId: string;
  @ViewChild(IonReorderGroup) reorderGroup: IonReorderGroup;
  translation: any;

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private alertCtrl: AlertController,
    private loadingController: LoadingController,
    private statusService: StatusService,
    private swarmGroupService: SwarmGroupService,
    private translate: TranslateService,
    private purchases: PurchaseService,
    private animationService: AnimationService,
    private router: Router,
    private appreview: AppreviewService,
    private storageSync: StorageSyncService
  ) {}

  async forceReloadSwarms(event) {
    await this.storageSync.clearStorage();
    await this.loadSwarms();
    event.target.complete();
  }

  async loadSwarms() {
    let loading = null;

    // Show spinner only if not loaded from local storage, which
    // is so fast a spinner would just flicker shortly.
    if (!(await this.storageSync.getFromStorage(LocalStorageKey.SWARMS))) {
      loading = await this.loadingController.create({
        message: this.translate.instant("COLONIES_PAGE.loading"),
        showBackdrop: true,
      });

      loading && (await loading.present());
    }

    const start = new Date();
    this.swarmService
      .getSwarms()
      .pipe(
        first(),
        tap((swarms: Swarm[]) => {
          console.log(`${differenceInMilliseconds(new Date(), start)} later`);
          this.appreview.checkReview(swarms);
        }),
        switchMap((swarms: Swarm[]) => {
          console.log(
            `${differenceInMilliseconds(
              new Date(),
              start
            )} later (app review done)`
          );
          return this.groupSwarms(swarms);
        }),
        tap((groups: UISwarmGroup[]) => {
          console.log(
            `${differenceInMilliseconds(new Date(), start)} later (entries)`
          );

          if (this._groupsDiffer(this.sortedSwarmGroups, groups)) {
            this.sortedSwarmGroups = groups;
          }

          if (this.sortedSwarmGroups.length === 0) {
            this.animationService.pulse(".addGroupButton", 5);
            this.animationService.pulse(".bee", 5);
          }
        }),
        switchMap(() => {
          console.log(
            `${differenceInMilliseconds(new Date(), start)} later (grouping)`
          );
          return this.loadJournalEntries();
        })
      )
      .subscribe(
        () => {
          loading && loading.dismiss();
        },
        (err) => {
          loading && loading.dismiss();
          console.log("ERROR", err);
        }
      );
  }

  private loadJournalEntries(): Observable<unknown> {
    let journalUpdates = [];
    for (let group of this.sortedSwarmGroups) {
      group.swarms.forEach((sw: Swarm) => {
        journalUpdates.push(
          this.journalService.getDigest(sw.id).pipe(
            tap((e: JournalEntry[]) => {
              if (e && e.length > 0) {
                sw.lastAction = e[0];
                sw.statusInfo = this.statusService.getColonyStatus(e);
              }
            })
          )
        );
      });
    }

    if (journalUpdates.length === 0) {
      return of([]);
    }

    return forkJoin(journalUpdates);
  }

  groupSwarms(swarms: Swarm[]): Observable<UISwarmGroup[]> {
    return this.swarmGroupService.getGroups().pipe(
      map((groups: SwarmGroup[]) => {
        let swarmsById = new Map<string, Swarm>();
        swarms.forEach((s) => {
          swarmsById.set(s.id, s);
        });

        let displayGroups: UISwarmGroup[] = [];

        groups.forEach((g) => {
          let displayGroup: UISwarmGroup = {
            id: g.id,
            name: g.name,
            swarms: [],
            lat: g.lat,
            lng: g.lng,
          };

          (g.swarmIds || []).forEach((sid) => {
            const swarm = swarmsById.get(sid);
            if (swarm) {
              displayGroup.swarms.push(swarm);
            }
          });

          displayGroups.push(displayGroup);
        });

        return displayGroups;
      })
    );
  }

  ionViewDidEnter() {
    this.loadSwarms();
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
    if (this.purchases.checkLimitReached(this._getNumberOfSwarms())) {
      this.requireFullVersion();
      return;
    }

    this.router.navigateByUrl(`/swarms/edit?groupId=${groupId}`);
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

  private _getNumberOfSwarms() {
    let num = 0;
    for (let group of this.sortedSwarmGroups) {
      num += group.swarms.length;
    }
    return num;
  }

  private _groupsDiffer(oldGroups: UISwarmGroup[], newGroups: UISwarmGroup[]) {
    if (!oldGroups || !newGroups || oldGroups.length !== newGroups.length) {
      return true;
    }

    for (let i = 0; i < oldGroups.length; i++) {
      const og = oldGroups[i];
      const ng = newGroups[i];

      if (
        og.swarms.length !== ng.swarms.length ||
        og.name !== ng.name ||
        og.lat !== ng.lat ||
        og.lng !== ng.lng
      ) {
        return true;
      }

      for (let j = 0; j < og.swarms.length; j++) {
        if (
          og.swarms[j].id !== ng.swarms[j].id ||
          og.swarms[j].name !== ng.swarms[j].name ||
          og.swarms[j].isNucleus !== ng.swarms[j].isNucleus
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
