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

const REMINDERS_STORAGE_KEY = "REMINDERS_STORAGE_KEY";

@Injectable({
  providedIn: "root",
})
export class ReminderService {
  constructor(private translate: TranslateService, private storage: Storage) {}

  async getReminders(swarmId: string): Promise<Reminder[]> {
    return this.storage
      .get(REMINDERS_STORAGE_KEY)
      .then((reminders: Reminder[]) => {
        if (!reminders) {
          return [];
        }

        const now = new Date();
        return reminders.filter(
          (r) => new Date(r.date) > now && r.swarmId === swarmId
        );
      });
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

    this.storage.get(REMINDERS_STORAGE_KEY).then((reminders: Reminder[]) => {
      if (!reminders) {
        reminders = [];
      }
      reminders.push(reminder);
      this.storage.set(REMINDERS_STORAGE_KEY, reminders);
    });
  }

  async deleteReminder(reminderId: number) {
    await LocalNotifications.cancel({
      notifications: [{ id: "" + reminderId }],
    });

    return this.storage
      .get(REMINDERS_STORAGE_KEY)
      .then((reminders: Reminder[]) => {
        reminders = reminders.filter((r) => r.reminderId !== reminderId);
        this.storage.set(REMINDERS_STORAGE_KEY, reminders);
      });
  }
}
