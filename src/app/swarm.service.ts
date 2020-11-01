import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';
import { JournalEntry } from './journal.service';
import { ColonyStatus } from './status.service';

export interface Swarm {
  id?: string;
  name: string;
  created: Date;
  status?: ColonyStatus;
  lastAction?: JournalEntry;
}

@Injectable({
  providedIn: 'root',
})
export class SwarmService {
  constructor(private db: AngularFireDatabase,
              private auth: AngularFireAuth) { }

  getSwarms(force: boolean = false): Observable<Swarm[]> {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.db
          .list(`users/${user.uid}/swarms`)
          .snapshotChanges()
          .pipe(
            take(1),
            map((swarmData: any[]) => {
              const swarms: Swarm[] = [];

              for (let i = 0; i < swarmData.length; i++) {
                const item: any = swarmData[i];
                const key = item.key;
                const value: any = item.payload.val();

                swarms.push({
                  id: key,
                  name: value.name,
                  created: new Date(value.created),
                });
              }
              return swarms;
            })
          );
      })
    );
  }

  getSwarm(id: string): Observable<Swarm> {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        return this.db.object(`users/${user.uid}/swarms/${id}`)
          .valueChanges()
          .pipe(
            take(1),
            map((s: any) => {
              return {
                id,
                name: s.name,
                created: new Date(s.created),
              };
            })
          );
      })
    );
  }

  createSwarm(s: Swarm): Observable<any> {
    return this.auth.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.db
          .list(`/users/${user.uid}/swarms`)
          .push(s);        
      })
    );
  }
}
