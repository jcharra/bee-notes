import { AuthService } from './auth/auth.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

export enum EntryType {
  VARROA_CHECK_START = 'Varroa check start',
  VARROA_CHECK_END = 'Varroa check end',
  VARROA_TREATMENT = 'Varroa treatment',
  HARVEST = 'Harvest',
  QUEEN_SPOTTED = 'Queen spotted',
  QUEEN_ADDED = 'Queen added',
  QUEEN_DECEASED = 'Queen deceased',
  EGGS_SPOTTED = 'Eggs spotted',
  DRONE_FRAME_ADDED = 'Drone frames added',
  DRONE_FRAME_REMOVED = 'Drone frames removed',
  CENTER_PANELS_ADDED = 'Center panels added',
  FRAMES_REMOVED = 'Frames removed',
  BROOD_COUNT = 'Brood count'
}

export interface JournalEntry {
  id?: string;
  title: string;
  text: string;
  date: Date;
  type?: EntryType;
  metadata?: any;
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
