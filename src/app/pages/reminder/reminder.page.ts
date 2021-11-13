import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NavController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { addDays, addHours, addYears, endOfYear, format, startOfHour } from "date-fns";
import { de } from "date-fns/locale";
import { first } from "rxjs/operators";
import { ReminderService } from "src/app/services/reminder.service";
import { SwarmGroup, SwarmGroupService } from "src/app/services/swarm-group.service";
import { SwarmService } from "src/app/services/swarm.service";
import { Swarm } from "src/app/types/Swarm";

const DAY_OF_YEAR = "yyyy-MM-dd H:mm";
@Component({
  selector: "app-reminder",
  templateUrl: "./reminder.page.html",
  styleUrls: ["./reminder.page.scss"],
})
export class ReminderPage implements OnInit {
  swarmId: string;
  groupId: string;
  swarm: Swarm;
  group: SwarmGroup;
  date = format(startOfHour(addHours(new Date(), 1)), DAY_OF_YEAR, { locale: de });
  minDate = format(new Date(), DAY_OF_YEAR);
  maxDate = format(endOfYear(addYears(new Date(), 1)), DAY_OF_YEAR);
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

  ngOnInit() {
    this.swarmId = this.route.snapshot.queryParams.swarmId;
    this.groupId = this.route.snapshot.queryParams.groupId;

    if (this.swarmId) {
      this.swarmService
        .getSwarm(this.swarmId)
        .pipe(first())
        .subscribe((s: Swarm) => {
          this.swarm = s;
        });
    }

    if (this.groupId) {
      this.groupService
        .getGroup(this.groupId)
        .pipe(first())
        .subscribe((g: SwarmGroup) => {
          this.group = g;
        });
    }
  }

  changeDate(diff) {
    const newDate = addDays(new Date(this.date), diff);
    if (newDate >= new Date(this.minDate)) {
      this.date = format(newDate, DAY_OF_YEAR);
    }
  }

  changeHour(diff) {
    this.date = format(addHours(new Date(this.date), diff), DAY_OF_YEAR, { locale: de });
  }

  save() {
    const reminder = {
      swarmId: this.swarmId || "",
      groupId: this.groupId || "",
      swarmName: this.swarm ? this.swarm.name : null,
      groupName: this.group ? this.group.name : null,
      text: this.text.trim(),
      date: new Date(this.date),
    };

    this.reminderService.createReminder(reminder).then(
      () => this.onReminderSaved(new Date(this.date)),
      (err) => this.onReminderCreationFailed(err)
    );
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
