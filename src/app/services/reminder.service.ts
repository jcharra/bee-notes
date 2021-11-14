import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { LocalNotifications } from "@capacitor/local-notifications";
import { TranslateService } from "@ngx-translate/core";
import { addDays, isBefore, startOfDay } from "date-fns";
import { from, of } from "rxjs";
import { first, map, switchMap, tap } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";
import { LocalStorageKey, StorageSyncService } from "./storage-sync.service";
export interface Reminder {
  reminderId?: number;
  swarmId?: string;
  groupId?: string;
  groupName?: string;
  swarmName?: string;
  date: Date;
  text: string;
}

@Injectable({
  providedIn: "root",
})
export class ReminderService {
  constructor(
    private translate: TranslateService,
    private db: AngularFireDatabase,
    private authService: AuthService,
    private storageSync: StorageSyncService
  ) {}

  getReminders(swarmId?: string) {
    console.log("Fetch for swarm", swarmId);
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return from(this.storageSync.getFromStorage(LocalStorageKey.REMINDERS, swarmId)).pipe(
          switchMap((localReminders) => {
            if (localReminders) {
              return of(localReminders);
            } else {
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

                    const filteredReminders = swarmId
                      ? currentReminders.filter((r) => r.swarmId === swarmId)
                      : currentReminders.filter((r) => !r.swarmId);

                    this.storageSync.writeToStorage(LocalStorageKey.REMINDERS, filteredReminders, swarmId);

                    return filteredReminders;
                  })
                );
            }
          })
        );
      })
    );
  }

  async updateReminder(reminder: Reminder) {
    await this.deleteReminder({ ...reminder });
    await this.createReminder({ ...reminder }); // will create a new reminder ID
  }

  async createReminder(reminder: Reminder) {
    await LocalNotifications.requestPermissions();

    reminder.reminderId = Math.floor(Math.random() * 1000000000);

    await LocalNotifications.schedule({
      notifications: [
        {
          title: reminder.swarmName
            ? this.translate.instant("REMINDERS.title", {
                swarmName: reminder.swarmName,
              })
            : this.translate.instant("REMINDERS.titleForGroup", {
                groupName: reminder.groupName,
              }),
          body: reminder.text,
          id: reminder.reminderId,
          schedule: { at: new Date(reminder.date) },
          extra: {
            swarmId: reminder.swarmId,
          },
        },
      ],
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

    this._markStorageAsDirty(reminder.swarmId);
  }

  async deleteReminder(reminder: Reminder) {
    console.log("Delete", reminder.reminderId);
    await LocalNotifications.cancel({
      notifications: [{ id: reminder.reminderId }],
    });

    this.authService
      .getUser()
      .pipe(
        first(),
        tap((user) => {
          this.db.object(`/users/${user.uid}/reminders/${reminder.reminderId}`).remove();
          console.log("Remove from firebase", reminder.reminderId);
        })
      )
      .subscribe();

    this._markStorageAsDirty(reminder.swarmId);
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

  private _markStorageAsDirty(swarmId?: string): Promise<any> {
    console.log("Clear reminders from local storage for swarm", swarmId);
    return this.storageSync.clearFromStorage(LocalStorageKey.REMINDERS, swarmId);
  }
}
