import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  LoadingController,
  ToastController
} from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
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
export class SwarmDetailPage implements OnInit, OnDestroy {
  swarmId: string;
  swarm: Swarm;
  journalEntries: JournalEntry[] = JOURNAL_PLACEHOLDER;
  userId: string;
  reminders: Reminder[];
  destroyed$ = new Subject<boolean>();

  constructor(
    private swarmService: SwarmService,
    private journalService: JournalService,
    private route: ActivatedRoute,
    private loadingCtrl: LoadingController,
    private alertCtrl: AlertController,
    private reminderService: ReminderService,
    private toastController: ToastController,
    private router: Router,
    private translate: TranslateService
  ) {}

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;
    this.userId = this.route.snapshot.data.userId;
  }

  ionViewDidEnter() {
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
      .then((reminders: Reminder[]) => {
        this.reminders = reminders;
      });
  }

  async onMissingValues() {
    const alert = await this.alertCtrl.create({
      header: "Error",
      message: this.translate.instant("JOURNAL_PAGE.invalidReminderInput"),
      buttons: ["OK"],
    });

    await alert.present();
  }

  async onReminderDismissed() {
    const toast = await this.toastController.create({
      message: this.translate.instant("JOURNAL_PAGE.onReminderDismissal"),
      duration: 2000,
    });

    toast.present();
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
      message: this.translate.instant(
        "COLONIES_PAGE.whereToFindExColoniesHint"
      ),
      duration: 6000,
    });
    toast.present();
  }

  async openRenameDialog() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.renameColonyTitle"),
      inputs: [
        {
          name: "name",
          type: "text",
          value: this.swarm.name,
        },
      ],
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("GENERAL.save"),
          cssClass: "danger",
          handler: (value) => {
            const name = value.name && value.name.trim();

            if (name) {
              this.swarm.name = name;
              this.swarmService.updateSwarm(this.swarm).subscribe();
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async deleteReminder(reminderId: number) {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("REMINDERS.deleteConfirmHeader"),
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant("GENERAL.delete"),
          handler: () => {
            this.reminderService.deleteReminder(reminderId).then(() => {
              this.onReminderDismissed();
              this.loadReminders();
            });
          },
        },
      ],
    });

    await alert.present();
  }

  ngOnDestroy() {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }
}
