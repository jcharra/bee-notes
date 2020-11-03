import { Injectable } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/database';
import { map, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';

export interface Reminder {
  id?: string;
  date: Date;
  text: string;
}

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  constructor(private db: AngularFireDatabase,
              private authService: AuthService) { }

  getReminders(swarmId: string) {
    return this.authService
      .getUser()
      .pipe(switchMap(user => {

        return this.db
          .list(`/users/${user.uid}/reminders/${swarmId}/reminders`)
          .snapshotChanges()
          .pipe(
            map(reminders => {
            const entries: Reminder[] = [];
            for (let i = 0; i < reminders.length; i++) {
              const item: any = reminders[i];
              const key = item.key;
              const value = item.payload.val();

              entries.push({
                id: key,
                text: value.text,
                date: new Date(value.date)
              });
            }

            entries.sort((a, b) => a.date < b.date ? -1 : 1);

            return entries;
          }));
      }));
  }

  createReminder(swarmId: string, reminder: Reminder) {
    return this.authService
      .getUser()
      .pipe(switchMap(user => {
        return this.db
          .list(`/users/${user.uid}/reminders/${swarmId}/reminders`)
          .push({
            text: reminder.text,
            date: reminder.date.toISOString()
          });
      }));
  }

  deleteReminder(swarmId: string, reminderId: string) {
    return this.authService
      .getUser()
      .pipe(switchMap(user => {
        return this.db
          .object(`/users/${user.uid}/reminders/${swarmId}/reminders/${reminderId}`)
          .remove();
      }));
  }
}
