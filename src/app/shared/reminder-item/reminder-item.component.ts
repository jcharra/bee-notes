import { Component, EventEmitter, Input, OnInit, Output } from "@angular/core";
import { AlertController, ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Reminder, ReminderService } from "src/app/services/reminder.service";

@Component({
  selector: "app-reminder-item",
  templateUrl: "./reminder-item.component.html",
  styleUrls: ["./reminder-item.component.scss"],
})
export class ReminderItemComponent implements OnInit {
  @Input() reminder: Reminder;
  @Output() notifyChange = new EventEmitter<string>();

  constructor(
    private alertCtrl: AlertController,
    private reminderService: ReminderService,
    private translate: TranslateService,
    private toastController: ToastController
  ) {}

  ngOnInit() {}

  async delete() {
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
            this.reminderService.deleteReminder(this.reminder).then(() => {
              this.onReminderDismissed();
              this.notifyChange.emit();
            });
          },
        },
      ],
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
}
