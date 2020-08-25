import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export interface JournalEntry {
  id?: string;
  title: string;
  text: string;
  date: Date;
}

@Injectable({
  providedIn: 'root'
})
export class JournalService {
  constructor(private http: HttpClient,
    private authService: AuthService) { }

  getEntries(swarmId: string, limit: number = -1): Observable<JournalEntry[]> {
    return this.authService
      .user
      .pipe(switchMap(user => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .get<{ [key: string]: any }>(`https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms/${swarmId}/journal.json?auth=${user.token}`)
          .pipe(map(data => {
            const entries: JournalEntry[] = [];
            for (const key in data) {
              if (data.hasOwnProperty(key)) {
                entries.push({
                  id: key,
                  title: data[key].title,
                  text: data[key].text,
                  date: new Date(data[key].date)
                });
              }
            }

            entries.sort((a, b) => { return a.date > b.date ? 1 : -1 });

            return limit > -1 ? entries.splice(0, limit) : entries;
          }));
      }));
  }

  createEntry(swarmId: string, entry: JournalEntry): Observable<any> {
    return this.authService
      .user
      .pipe(switchMap(user => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .post(`https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms/${swarmId}/journal.json?auth=${user.token}`, entry);
      }));
  }

  updateEntry(swarmId: string, entry: JournalEntry) {
    return this.authService
      .user
      .pipe(switchMap(user => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .put(`https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms/${swarmId}/journal/${entry.id}.json?auth=${user.token}`, entry);
      }));
  }

  deleteEntry(swarmId: string, id: string) {
    return this.authService
      .user
      .pipe(switchMap(user => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .delete(`https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms/${swarmId}/journal/${id}.json?auth=${user.token}`);
      }));
  }
}
