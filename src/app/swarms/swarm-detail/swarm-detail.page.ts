import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { addDays, format, startOfDay } from "date-fns";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { EntryType } from "src/app/model/EntryType";
import { JournalEntry } from "src/app/model/JournalEntry";
import { JournalService } from "../../journal.service";
import { Swarm, SwarmService } from "../../swarm.service";
import { Reminder, ReminderService } from "./../../reminder.service";

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

  async addReminder() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("JOURNAL_PAGE.addReminder"),
      inputs: [
        {
          name: "text",
          type: "text",
          placeholder: this.translate.instant(
            "JOURNAL_PAGE.reminderTextPlaceholder"
          ),
        },
        {
          name: "days",
          type: "number",
          placeholder: this.translate.instant("JOURNAL_PAGE.reminderNumDays"),
        },
      ],
      buttons: [
        {
          text: this.translate.instant("GENERAL.cancel"),
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: this.translate.instant(
            "JOURNAL_PAGE.createReminderButtonCaption"
          ),
          cssClass: "primary",
          handler: (value) => {
            const text = value.text.trim();
            const days = parseInt(value.days.trim());
            if (!text || !days) {
              this.onMissingValues();
            } else {
              const date = startOfDay(addDays(new Date(), days));
              const reminder = {
                text,
                date,
              };

              this.reminderService
                .createReminder(this.swarmId, reminder)
                .subscribe(() => {
                  this.onReminderSaved(date);
                });
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

  loadReminders() {
    this.reminderService
      .getReminders(this.swarmId)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((reminders: Reminder[]) => {
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

  deleteReminder(reminderId: string) {
    this.reminderService
      .deleteReminder(this.swarmId, reminderId)
      .subscribe(() => {
        this.onReminderDismissed();
      });
  }

  async onReminderSaved(date: Date) {
    const toast = await this.toastController.create({
      message: this.translate.instant("JOURNAL_PAGE.onReminderSuccess", {
        date: format(date, "yyyy-MM-dd"),
      }),
      duration: 2000,
    });
    toast.present();
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

  async trackWeight() {
    const alert = await this.alertCtrl.create({
      header: this.translate.instant("COLONIES_PAGE.weightDialogHeader"),
      message: this.translate.instant("COLONIES_PAGE.weightDialogMsg"),
      inputs: [
        {
          name: "name",
          type: "text",
          value: 0,
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
            const weight = value.name && +value.name.trim();

            if (weight) {
              this.journalService
                .createEntry(this.swarmId, {
                  date: new Date().toISOString(),
                  text: "",
                  amount: weight,
                  type: EntryType.WEIGHT_MEASURED,
                })
                .subscribe(() => {
                  this.loadData(true);
                });
            }
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
