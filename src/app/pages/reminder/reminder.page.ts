import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { addHours, addYears, endOfYear, format, startOfHour } from "date-fns";
import { first, tap } from "rxjs/operators";
import { Reminder, ReminderService } from "src/app/services/reminder.service";
import { SwarmGroup, SwarmGroupService } from "src/app/services/swarm-group.service";
import { SwarmService } from "src/app/services/swarm.service";
import { Swarm } from "src/app/types/Swarm";

@Component({
  selector: "app-reminder",
  templateUrl: "./reminder.page.html",
  styleUrls: ["./reminder.page.scss"],
})
export class ReminderPage {
  swarmId: string;
  groupId: string;
  swarmName: string;
  groupName: string;
  reminderId: number;
  isoDate: string;
  datePart: string;
  timePart: string;
  minDate = new Date().toISOString();
  maxDate = endOfYear(addYears(new Date(), 1)).toISOString();
  text: string;

  constructor(
    private reminderService: ReminderService,
    private swarmService: SwarmService,
    private groupService: SwarmGroupService,
    private translate: TranslateService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController
  ) {}

  ionViewWillEnter() {
    this.swarmId = this.route.snapshot.queryParams.swarmId;
    this.groupId = this.route.snapshot.queryParams.groupId;
    this.reminderId = this.route.snapshot.queryParams.reminderId;

    if (this.swarmId) {
      this.swarmService
        .getSwarm(this.swarmId)
        .pipe(first())
        .subscribe((s: Swarm) => {
          this.swarmName = s.name;
        });
    } else {
      this.swarmName = "";
    }

    if (this.groupId) {
      this.groupService
        .getGroup(this.groupId)
        .pipe(first())
        .subscribe((g: SwarmGroup) => {
          this.groupName = g.name;
        });
    } else {
      this.groupName = "";
    }

    if (this.reminderId) {
      this.reminderService
        .getReminders(this.swarmId)
        .pipe(
          first(),
          tap((rems: Reminder[]) => {
            const rem = rems.find((r) => r.reminderId === +this.reminderId);
            if (rem) {
              this.setDateTime(rem.date.toISOString());
              this.text = rem.text;
              this.groupId = rem.groupId;
              this.swarmId = rem.swarmId;
              this.swarmName = rem.swarmName;
              this.groupName = rem.groupName;
            }
          })
        )
        .subscribe();
    } else {
      this.setDateTime(startOfHour(addHours(new Date(), 1)).toISOString());
    }
  }

  save() {
    const reminder = {
      swarmId: this.swarmId || "",
      groupId: this.groupId || "",
      swarmName: this.swarmName || "",
      groupName: this.groupName || "",
      text: this.text.trim(),
      date: new Date(this.isoDate),
    };

    if (this.reminderId) {
      this.reminderService
        .updateReminder({
          reminderId: this.reminderId,
          ...reminder,
        })
        .then(
          () => this.onReminderSaved(new Date(this.isoDate)),
          (err) => this.onReminderCreationFailed(err)
        );
    } else {
      this.reminderService.createReminder(reminder).then(
        () => this.onReminderSaved(new Date(this.isoDate)),
        (err) => this.onReminderCreationFailed(err)
      );
    }
  }

  setDateTime(d: string | string[]) {
    this.isoDate = typeof d === "string" ? d : d[0];
    const date = new Date(typeof d === "string" ? d : d[0]);
    this.datePart = format(date, "dd.MM.yyyy");
    this.timePart = format(date, "HH:mm");
    console.log("Date:", this.isoDate, " Datepart:", this.datePart, " Time:", this.timePart);
  }

  async onReminderSaved(date: Date) {
    const toast = await this.toastController.create({
      message: this.translate.instant("JOURNAL_PAGE.onReminderSuccess", {
        date: format(date, "yyyy-MM-dd"),
      }),
      duration: 2000,
    });
    toast.present();
    this.navCtrl.back();
  }

  async onReminderCreationFailed(err) {
    const toast = await this.toastController.create({
      message: this.translate.instant("JOURNAL_PAGE.onReminderFailure", {
        error: err,
      }),
      duration: 4000,
    });
    toast.present();
  }
}
