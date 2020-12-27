import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import {
  AlertController,
  LoadingController,
  ToastController,
} from "@ionic/angular";
import { addDays, format, startOfDay } from "date-fns";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";
import { JournalEntry } from "src/app/journal.service";
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
    private router: Router
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
      message: "Loading journal...",
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
      .getEntries(this.swarmId, JOURNAL_PLACEHOLDER.length)
      .pipe(takeUntil(this.destroyed$))
      .subscribe((entries: JournalEntry[]) => {
        this.journalEntries = entries;
        withSpinner && loading.dismiss();
      });

    this.loadReminders();
  }

  async addReminder() {
    const alert = await this.alertCtrl.create({
      header: "Add reminder",
      inputs: [
        {
          name: "text",
          type: "text",
          placeholder: "Reminder text",
        },
        {
          name: "days",
          type: "number",
          placeholder: "Number of days",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Create reminder",
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
      message: "Invalid input. Please enter a description and an integer.",
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
      message: "You will be reminded on " + format(date, "yyyy-MM-dd"),
      duration: 2000,
    });
    toast.present();
  }

  async onReminderDismissed() {
    const toast = await this.toastController.create({
      message: "Reminder dismissed",
      duration: 2000,
    });

    toast.present();
  }

  async changeLocation() {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        console.log("POS", pos);
      },
      (err) => {
        console.log("DENIED", err);
      }
    );
  }

  async markAsDeceased() {
    const alert = await this.alertCtrl.create({
      header: "Colony deceased",
      message: "Do you really want to mark this colony as deceased?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Yes 😢",
          cssClass: "danger",
          handler: () => {
            this.swarmService.markAsDeceased(this.swarm).subscribe(() => {
              this.router.navigateByUrl("/");
            });
          },
        },
      ],
    });

    await alert.present();
  }

  async markAsSold() {
    const alert = await this.alertCtrl.create({
      header: "Colony sold",
      message: "Did you sell this colony?",
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
        },
        {
          text: "Mark as sold",
          cssClass: "danger",
          handler: () => {
            this.swarmService.markAsSold(this.swarm).subscribe(() => {
              this.router.navigateByUrl("/");
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
