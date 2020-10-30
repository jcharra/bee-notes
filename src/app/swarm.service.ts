import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { AngularFireDatabase } from '@angular/fire/database';
import { Observable } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
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

        return this.db.object(`users/${user.uid}/swarms`)
          .valueChanges()
          .pipe(
            catchError((err) => []),
            map((swarmData) => {
              const swarms: Swarm[] = [];
              for (const key in swarmData) {
                if (swarmData.hasOwnProperty(key)) {
                  swarms.push({
                    id: key,
                    name: swarmData[key].name,
                    created: new Date(swarmData[key].created),
                  });
                }
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
