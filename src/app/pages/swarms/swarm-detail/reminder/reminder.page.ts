import { NavController } from '@ionic/angular';
import { SwarmService } from 'src/app/services/swarm.service';
import { ActivatedRoute } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { addYears, format, endOfYear, addHours, startOfDay, addDays } from 'date-fns';
import { de } from 'date-fns/locale';
import { ReminderService } from 'src/app/services/reminder.service';
import { Swarm } from 'src/app/types/Swarm';
import { first } from 'rxjs/operators';

const DAY_OF_YEAR = "yyyy-MM-dd";

@Component({
  selector: 'app-reminder',
  templateUrl: './reminder.page.html',
  styleUrls: ['./reminder.page.scss'],
})
export class ReminderPage implements OnInit {
  swarmId: string;
  swarm: Swarm;
  date = format(addDays(new Date(), 1), DAY_OF_YEAR, { locale: de });
  minDate = format(addDays(new Date(), 1), DAY_OF_YEAR);
  maxDate = format(endOfYear(addYears(new Date(), 1)), DAY_OF_YEAR);
  text: string;

  constructor(private reminderService: ReminderService,
    private swarmService: SwarmService,
    private translate: TranslateService,
    private toastController: ToastController,
    private route: ActivatedRoute,
    private navCtrl: NavController) { }

  ngOnInit() {
    this.swarmId = this.route.snapshot.params.swarmId;

    this.swarmService
      .getSwarm(this.swarmId)
      .pipe(first())
      .subscribe((s: Swarm) => {
        this.swarm = s;
      });
  }

  changeDate(diff) {
    const newDate = addDays(new Date(this.date), diff);
    if (newDate >= new Date(this.minDate)) {
      this.date = format(newDate, DAY_OF_YEAR);
    }
  }

  save() {
    const date = addHours(startOfDay(new Date(this.date)), 9);
    const reminder = {
      swarmId: this.swarmId,
      swarmName: this.swarm.name,
      text: this.text.trim(),
      date,
    };

    this.reminderService.createReminder(reminder).then(
      () => this.onReminderSaved(date),
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
