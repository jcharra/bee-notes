import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

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
  amount?: number;
}

@Injectable({
  providedIn: 'root',
})
export class JournalService {
  private entryCacheForColony = new Map<string, JournalEntry[]>();

  constructor(private db: AngularFireDatabase,
              private auth: AngularFireAuth) { }

  getEntry(swarmId: string, entryId: string): Observable<JournalEntry> {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.db
          .object(`/users/${user.uid}/journals/${swarmId}/entries/${entryId}`)
          .valueChanges()
          .pipe(map((entry: any) => {
            return {
              id: entry.id,
              title: entry.title,
              text: entry.text,
              type: entry.type,
              date: new Date(entry.date),
              amount: entry.amount
            }
          }));
      }));
  }

  getEntries(swarmId: string, limit: number = 100): Observable<JournalEntry[]> {
    const cacheKey = `${swarmId}_${limit}`;
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        const cached = this.entryCacheForColony.get(cacheKey);

        if (cached) {
          return of(cached);
        }

        const entries = this.db
          .list(`/users/${user.uid}/journals/${swarmId}/entries`)
          .snapshotChanges()
          .pipe(
            take(1),
            map((data: any[]) => {
              if (!data) {
                return [];
              }

              const entries: JournalEntry[] = [];
              for (let i = 0; i < data.length; i++) {
                const item: any = data[i];
                const key = item.key;
                const value: any = item.payload.val();
                entries.unshift({
                  id: key,
                  title: value.title,
                  text: value.text,
                  type: value.type,
                  date: new Date(value.date),
                  amount: value.amount
                });
              }

              entries.sort((a, b) => {
                return a.date < b.date ? 1 : -1;
              });

              return limit > -1 ? entries.splice(0, limit) : entries;
            })
          );
        return entries;
      }),
      tap((entries: JournalEntry[]) => {
        this.entryCacheForColony.set(cacheKey, entries);
      })
    );
  }

  createEntry(swarmId: string, entry: JournalEntry): Observable<any> {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        this.clearCacheForColony(swarmId);

        return this.db
          .list(`/users/${user.uid}/journals/${swarmId}/entries`)
          .push(entry);
      })
    );
  }

  updateEntry(swarmId: string, entry: JournalEntry) {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        this.clearCacheForColony(swarmId);

        return this.db
          .object(`/users/${user.uid}/journals/${swarmId}/entries/${entry.id}`)
          .update(entry);
      })
    );
  }

  deleteEntry(swarmId: string, id: string) {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        this.clearCacheForColony(swarmId);

        return this.db
          .object(`/users/${user.uid}/journals/${swarmId}/entries/${id}`)
          .remove();
      })
    );
  }

  private clearCacheForColony(colonyId: string) {
    const deletable = [];
    for (let k of this.entryCacheForColony.keys()) {
      if (k.startsWith(colonyId)) {
        deletable.push(k);
      }
    }
    deletable.forEach(d => this.entryCacheForColony.delete(d));
  }
}
