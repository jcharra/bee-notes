import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Storage } from "@ionic/storage";
import { TranslateService } from "@ngx-translate/core";
import { addDays, isBefore, startOfDay } from "date-fns";
import { Observable } from "rxjs";
import { first, map, switchMap, tap } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";
import { LocalNotifications } from "@ionic-native/local-notifications/ngx";

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
  constructor(
    private translate: TranslateService,
    private storage: Storage,
    private db: AngularFireDatabase,
    private authService: AuthService,
    private localNotifications: LocalNotifications
  ) {}

  getReminders(swarmId?: string): Observable<Reminder[]> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db
          .list(`users/${user.uid}/reminders`)
          .snapshotChanges()
          .pipe(
            first(),
            map((rs: any[]) => {
              let reminders: Reminder[] = [];

              for (let i = 0; i < rs.length; i++) {
                const item: any = rs[i];
                const key = item.key;
                const value: any = item.payload.val();

                reminders.push({
                  reminderId: key,
                  ...value,
                  date: new Date(value.date),
                });
              }

              // Show reminders if not older than 3 days
              const obsoleteReminders = [];
              const currentReminders = [];

              for (const r of reminders) {
                if (isBefore(r.date, startOfDay(addDays(new Date(), -3)))) {
                  obsoleteReminders.push(r);
                } else {
                  currentReminders.push(r);
                }
              }

              this.cleanupReminders(obsoleteReminders.map((r) => r.reminderId));

              return swarmId
                ? currentReminders.filter((r) => r.swarmId === swarmId)
                : currentReminders;
            })
          );
      })
    );
  }

  async createReminder(reminder: Reminder) {
    await this.localNotifications.requestPermission();

    reminder.reminderId = Math.floor(Math.random() * 1000000000);

    await this.localNotifications.schedule({
      title: this.translate.instant("REMINDERS.title", {
        swarmName: reminder.swarmName,
      }),
      text: reminder.text,
      id: reminder.reminderId,
      trigger: { at: new Date(reminder.date) },
      data: {
        swarmId: reminder.swarmId,
      },
    });

    this.authService
      .getUser()
      .pipe(
        first(),
        tap((user) => {
          this.db
            .object(`users/${user.uid}/reminders/${reminder.reminderId}`)
            .set({ ...reminder, date: reminder.date.toISOString() });
        })
      )
      .subscribe();

    this.storage.get(REMINDERS_STORAGE_KEY).then((reminders: Reminder[]) => {
      if (!reminders) {
        reminders = [];
      }
      reminders.push(reminder);
      this.storage.set(REMINDERS_STORAGE_KEY, reminders);
    });
  }

  async deleteReminder(reminderId: number) {
    await this.localNotifications.cancel({
      notifications: [{ id: "" + reminderId }],
    });

    this.authService
      .getUser()
      .pipe(
        first(),
        tap((user) => {
          return this.db
            .object(`/users/${user.uid}/reminders/${reminderId}`)
            .remove();
        })
      )
      .subscribe();

    return this.storage
      .get(REMINDERS_STORAGE_KEY)
      .then((reminders: Reminder[]) => {
        reminders = reminders.filter((r) => r.reminderId !== reminderId);
        this.storage.set(REMINDERS_STORAGE_KEY, reminders);
      });
  }

  cleanupReminders(reminderIds: number[]) {
    this.authService
      .getUser()
      .pipe(
        first(),
        tap((user) => {
          for (const rid of reminderIds) {
            this.db.object(`/users/${user.uid}/reminders/${rid}`).remove();
          }
        })
      )
      .subscribe();
  }
}
