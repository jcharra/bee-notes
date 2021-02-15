import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable, of } from "rxjs";
import { first, map, switchMap, take, tap } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";
import { JournalEntry } from "../types/JournalEntry";

interface QueryConfig {
  limit?: number;
  startAt?: string;
  endAt?: string;
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

  getEntries(
    swarmId: string,
    config: QueryConfig = {}
  ): Observable<JournalEntry[]> {
    const startAt = config.startAt || "2000-01-01";
    const endAt = config.endAt || "2050-12-31";
    const limit = config.limit || 1000;

    const cacheKey = `${swarmId}_${startAt}_${endAt}_${limit}`;
    return this.authService.getUser().pipe(
      switchMap((user) => {
        const cached = this.entryCacheForColony.get(cacheKey);

        if (cached) {
          return of(cached);
        }

        const entries = this.db
          .list(`/users/${user.uid}/journals/${swarmId}/entries`, (ref) =>
            ref
              .orderByChild("date")
              .startAt(startAt)
              .endAt(endAt)
              .limitToLast(limit)
          )
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

        const fbEntry = this.convertToFirebaseEntry(entry);
        return this.db
          .list(`/users/${user.uid}/journals/${swarmId}/entries`)
          .push(fbEntry);
      })
    );
  }

  updateEntry(swarmId: string, entry: JournalEntry) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this.clearCacheForColony(swarmId);

        const fbEntry = this.convertToFirebaseEntry(entry);

        return this.db
          .object(
            `/users/${user.uid}/journals/${swarmId}/entries/${fbEntry.id}`
          )
          .update(fbEntry);
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

  private convertToFirebaseEntry(e: JournalEntry) {
    const clone: any = { ...e };
    clone.date = new Date(e.date).toISOString();
    return clone;
  }
}
