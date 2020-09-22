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
  BROOD_COUNT = 'Brood count',
  FOOD_ADDED = 'Food added'
}

export interface JournalEntry {
  id?: string;
  title?: string;
  text: string;
  date: Date;
  type?: EntryType;
  metadata?: any;
}

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  constructor(private http: HttpClient, private authService: AuthService) {}

  getEntry(swarmId: string, entryId: string): Observable<JournalEntry> {
    return this.authService.user.pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .get<{ [key: string]: any }>(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/journals/${swarmId}/entries/${entryId}.json?auth=${user.token}`
          )
          .pipe(map(entry => { 
            return {
              id: entry.id,
              title: entry.title,
              text: entry.text,
              type: entry.type,
              date: new Date(entry.date),
            }
          }));
      }));  
  }
  
  getEntries(swarmId: string, limit: number = 100): Observable<JournalEntry[]> {
    return this.authService.user.pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .get<{ [key: string]: any }>(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/journals/${swarmId}/entries.json?auth=${user.token}&limitToLast=${limit}&orderBy="date"`
          )
          .pipe(
            map((data) => {
              const entries: JournalEntry[] = [];
              for (const key in data) {
                if (data.hasOwnProperty(key)) {
                  // use unshift, since entries are returned in inversed order
                  entries.unshift({
                    id: key,
                    title: data[key].title,
                    text: data[key].text,
                    type: data[key].type,
                    date: new Date(data[key].date),
                  });
                }
              }

              entries.sort((a, b) => {
                return a.date < b.date ? 1 : -1;
              });

              return limit > -1 ? entries.splice(0, limit) : entries;
            })
          );
      })
    );
  }

  createEntry(swarmId: string, entry: JournalEntry): Observable<any> {
    return this.authService.user.pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http.post(
          `https://beetracker-6865b.firebaseio.com/users/${user.id}/journals/${swarmId}/entries.json?auth=${user.token}`,
          entry
        );
      })
    );
  }

  updateEntry(swarmId: string, entry: JournalEntry) {
    return this.authService.user.pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http.put(
          `https://beetracker-6865b.firebaseio.com/users/${user.id}/journals/${swarmId}/entries/${entry.id}.json?auth=${user.token}`,
          entry
        );
      })
    );
  }

  deleteEntry(swarmId: string, id: string) {
    return this.authService.user.pipe(
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http.delete(
          `https://beetracker-6865b.firebaseio.com/users/${user.id}/journals/${swarmId}/entries/${id}.json?auth=${user.token}`
        );
      })
    );
  }

  migrateToEntries(swarmId: string, entries: JournalEntry[]) {
    this.authService.user.subscribe(
      user => {
        if (!user) {
          throw new Error('No user found');
        }

        entries.forEach(e => { 
          return this.http.put(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/journals/${swarmId}/entries/${e.id}.json?auth=${user.token}`,
            e
          ).subscribe();
        });        
      });
  }
}
