import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable, of } from "rxjs";
import { first, map, switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";

export enum EntryType {
  // all varroa actions
  VARROA_CHECK_START = "Varroa check start",
  VARROA_CHECK_END = "Varroa check end",
  VARROA_TREATMENT = "Varroa treatment",

  // all frame actions
  FRAMES_HONEY_REMOVED = "Removed honey combs",
  FRAMES_HONEY_INSERTED = "Inserted honey combs",
  FRAMES_DRONE_REMOVED = "Removed drone combs",
  FRAMES_DRONE_INSERTED = "Inserted drone combs",
  FRAMES_EMPTY_PANEL_REMOVED = "Removed empty panels",
  FRAMES_EMPTY_PANEL_INSERTED = "Inserted empty panels",
  FRAMES_EMPTY_COMBS_REMOVED = "Removed empty combs",
  FRAMES_EMPTY_COMBS_INSERTED = "Inserted empty combs",
  FRAMES_BROOD_REMOVED = "Removed brood combs",
  FRAMES_BROOD_INSERTED = "Inserted brood combs",
  FRAMES_BROOD_COUNTED = "Count brood combs",

  // all queen actions
  QUEEN_SPOTTED = "Queen spotted",
  QUEEN_ADDED = "Queen added",
  QUEEN_DECEASED = "Queen deceased",
  QUEEN_EGGS_SPOTTED = "Eggs spotted",

  // food actions
  FOOD_ADDED = "Food added",
}

export const actionsForType = {
  queen: [
    EntryType.QUEEN_SPOTTED,
    EntryType.QUEEN_ADDED,
    EntryType.QUEEN_DECEASED,
    EntryType.QUEEN_EGGS_SPOTTED,
  ],
  varroa: [
    EntryType.VARROA_CHECK_END,
    EntryType.VARROA_CHECK_START,
    EntryType.VARROA_TREATMENT,
  ],
  frames: [
    EntryType.FRAMES_BROOD_INSERTED,
    EntryType.FRAMES_BROOD_REMOVED,
    EntryType.FRAMES_DRONE_INSERTED,
    EntryType.FRAMES_DRONE_REMOVED,
    EntryType.FRAMES_EMPTY_COMBS_INSERTED,
    EntryType.FRAMES_EMPTY_COMBS_REMOVED,
    EntryType.FRAMES_EMPTY_PANEL_INSERTED,
    EntryType.FRAMES_EMPTY_PANEL_REMOVED,
    EntryType.FRAMES_HONEY_INSERTED,
    EntryType.FRAMES_HONEY_REMOVED,
  ],
  food: [EntryType.FOOD_ADDED],
};

export interface JournalEntry {
  id?: string;
  title?: string;
  text: string;
  date: Date | string;
  type?: EntryType;
  amount?: number;
}

@Injectable({
  providedIn: "root",
})
export class JournalService {
  private entryCacheForColony = new Map<string, JournalEntry[]>();

  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {}

  getEntry(swarmId: string, entryId: string): Observable<JournalEntry> {
    return this.authService.getUser().pipe(
      first(),
      switchMap((user) => {
        return this.db
          .object(`/users/${user.uid}/journals/${swarmId}/entries/${entryId}`)
          .valueChanges()
          .pipe(
            map((entry: any) => {
              return {
                id: entry.id,
                title: entry.title,
                text: entry.text,
                type: entry.type,
                date: new Date(entry.date),
                amount: entry.amount,
              };
            })
          );
      })
    );
  }

  getEntries(swarmId: string, limit: number = 100): Observable<JournalEntry[]> {
    const cacheKey = `${swarmId}_${limit}`;
    return this.authService.getUser().pipe(
      switchMap((user) => {
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
                  amount: value.amount,
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
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this.clearCacheForColony(swarmId);

        return this.db
          .list(`/users/${user.uid}/journals/${swarmId}/entries`)
          .push(entry);
      })
    );
  }

  updateEntry(swarmId: string, entry: JournalEntry) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this.clearCacheForColony(swarmId);

        return this.db
          .object(`/users/${user.uid}/journals/${swarmId}/entries/${entry.id}`)
          .update(entry);
      })
    );
  }

  deleteEntry(swarmId: string, id: string) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
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
    deletable.forEach((d) => this.entryCacheForColony.delete(d));
  }
}
