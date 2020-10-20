import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take, switchMap, map } from 'rxjs/operators';
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

  constructor(private http: HttpClient,
              private authService: AuthService) { }

  getReminders(swarmId: string) {
    return this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .get<{ [key: string]: any }>(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/reminders/${swarmId}/reminders.json?auth=${user.token}`
          )
          .pipe(map(reminders => {

            const entries: Reminder[] = [];
            for (const key in reminders) {
              if (reminders.hasOwnProperty(key)) {
                entries.push({
                  id: key,
                  text: reminders[key].text,
                  date: new Date(reminders[key].date)
                });
              }
            }

            return entries;
          }));
      }));
  }

  createReminder(swarmId: string, reminder: Reminder) {
    return this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .post(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/reminders/${swarmId}/reminders.json?auth=${user.token}`,
            reminder
          );
      }));
  }

  deleteReminder(swarmId: string, reminderId: string) {
    return this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .delete(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/reminders/${swarmId}/reminders/${reminderId}.json?auth=${user.token}`
          );
      }));
  }
}
