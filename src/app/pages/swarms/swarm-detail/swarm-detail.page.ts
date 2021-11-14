import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { ActionSheetController, AlertController, LoadingController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { forkJoin, Subject } from "rxjs";
import { first, takeUntil } from "rxjs/operators";
import { SwarmGroup, SwarmGroupService } from "src/app/services/swarm-group.service";
import { JournalService } from "../../../services/journal.service";
import { Reminder, ReminderService } from "../../../services/reminder.service";
import { SwarmService } from "../../../services/swarm.service";
import { JournalEntry } from "../../../types/JournalEntry";
import { Swarm } from "../../../types/Swarm";

const JOURNAL_PLACEHOLDER = Array(3).fill({ text: "", date: new Date() });

@Component({
  selector: "app-swarm-detail",
  templateUrl: "./swarm-detail.page.html",
  styleUrls: ["./swarm-detail.page.scss"],
})
export class SwarmDetailPage implements OnDestroy {
  swarmId: string;
  swarm: Swarm;
  journalEntries: JournalEntry[] = JOURNAL_PLACEHOLDER;
  userId: string;
  reminders: Reminder[];
  destroyed$ = new Subject<boolean>();
  now = new Date();

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private reminderService: ReminderService,
    private toastController: ToastController,
    private router: Router,
    private translate: TranslateService,
    private swarmGroupService: SwarmGroupService,
    private actionSheetController: ActionSheetController
  ) {}

  ionViewWillEnter() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.userId = this.route.snapshot.data.userId;
    this.loadData(!this.journalEntries || this.journalEntries.length === 0);
  }

  async loadData(withSpinner: boolean = true) {
    const loading = await this.loadingCtrl.create({
      message: this.translate.instant("JOURNAL_PAGE.loading"),
      showBackdrop: true,
    });

    withSpinner && (await loading.present());

    this.swarmService
      .getSwarm(this.swarmId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((s: Swarm) => {
        this.swarm = s;
      });

    this.journalService
      .getEntries(this.swarmId, { limit: JOURNAL_PLACEHOLDER.length })
      .pipe(takeUntil(this.destroyed$))
      .subscribe((entries: JournalEntry[]) => {
        this.journalEntries = entries;
        withSpinner && loading.dismiss();
      });

    this.loadReminders();
  }

  loadReminders() {
    this.reminderService
      .getReminders(this.swarmId)
      .pipe(first())
      .subscribe((rs: Reminder[]) => {
        this.reminders = rs;
      });
  }

  async markAsDeceased() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.closeColonyHeader"),
      message: this.translate.instant("COLONIES_PAGE.closeColonyBody"),
      buttons: [
        {
          text: this.translate.instant("COLONIES_PAGE.markAsDeceased"),
          cssClass: "danger",
          handler: async () => {
            this.swarmService.markAsDeceased(this.swarm).subscribe(() => {
              this.router.navigateByUrl("/");
            });
            this.showWhereToFindHint();
          },
        },
        {
          text: this.translate.instant("COLONIES_PAGE.markAsDissolved"),
          cssClass: "danger",
          handler: async () => {
            this.swarmService.markAsDissolved(this.swarm).subscribe(() => {
              this.router.navigateByUrl("/");
            });
            this.showWhereToFindHint();
          },
        },
        {
          text: this.translate.instant("COLONIES_PAGE.markAsSold"),
          cssClass: "danger",
          handler: async () => {
            this.swarmService.markAsSold(this.swarm).subscribe(() => {
              this.router.navigateByUrl("/");
            });
            this.showWhereToFindHint();
          },
        },
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
        },
      ],
    });

    await alert.present();
  }

  async showWhereToFindHint() {
    const toast = await this.toastController.create({
      message: this.translate.instant("COLONIES_PAGE.whereToFindExColoniesHint"),
      duration: 6000,
    });
    toast.present();
  }

  changeGroup() {
    this.swarmGroupService
      .getGroups()
      .pipe(first())
      .subscribe(async (groups: SwarmGroup[]) => {
        const selection = await this.actionSheetController.create({
          header: this.translate.instant("COLONIES_PAGE.changeGroupSelect"),
          buttons: groups.map((g) => {
            return {
              text: g.name,
              handler: () => {
                this.moveToGroup(groups, g.id);
              },
            };
          }),
        });

        selection.present();
      });
  }

  moveToGroup(groups: SwarmGroup[], targetId: string) {
    let fromGroup, toGroup;
    for (let group of groups) {
      if (group.swarmIds && group.swarmIds.indexOf(this.swarmId) > -1) {
        fromGroup = group;
      }

      if (group.id === targetId) {
        toGroup = group;
      }
    }

    if (fromGroup.id === toGroup.id) {
      return;
    }

    fromGroup.swarmIds = fromGroup.swarmIds.filter((i) => i !== this.swarmId);
    if (toGroup.swarmIds) {
      toGroup.swarmIds.push(this.swarmId);
    } else {
      toGroup.swarmIds = [this.swarmId];
    }

    forkJoin([this.swarmGroupService.updateGroup(fromGroup), this.swarmGroupService.updateGroup(toGroup)]).subscribe(
      () => {
        this.router.navigateByUrl("/swarms");
      }
    );
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
