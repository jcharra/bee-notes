import { Injectable } from "@angular/core";
import { Plugins } from "@capacitor/core";
import { TranslateService } from "@ngx-translate/core";
const { LocalNotifications } = Plugins;
import { Storage } from "@ionic/storage";

export interface Reminder {
  reminderId?: number;
  swarmId: string;
  swarmName: string;
  date: Date;
  text: string;
}

@Injectable({
  providedIn: "root",
})
export class ReminderService {
  constructor(private translate: TranslateService, private storage: Storage) {}

  async getReminders(swarmId: string): Promise<Reminder[]> {
    // maybe build a way to fetch reminders one day ...
    return Promise.resolve([]);
  }

  async createReminder(reminder: Reminder) {
    await LocalNotifications.requestPermission();

    reminder.reminderId = Math.floor(Math.random() * 1000000000);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: this.translate.instant("REMINDERS.title", {
            swarmName: reminder.swarmName,
          }),
          body: reminder.text,
          id: reminder.reminderId,
          schedule: { at: new Date(reminder.date) },
          sound: null,
          attachments: null,
          actionTypeId: "",
          extra: {
            swarmId: reminder.swarmId,
          },
        },
      ],
    });
  }
}
