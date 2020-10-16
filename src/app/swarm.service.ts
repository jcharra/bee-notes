import { ColonyStatus } from './status.service';
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';
import { AuthService } from './auth/auth.service';
import { JournalEntry } from './journal.service';

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
  constructor(private http: HttpClient, private authService: AuthService) {}

  getSwarms(force: boolean = false): Observable<Swarm[]> {
    return this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .get<{ [key: string]: Swarm }>(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms.json?auth=${user.token}`
          )
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
    return this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http
          .get(
            `https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms/${id}.json?auth=${user.token}`
          )
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

  createSwarm(s: Swarm): Observable<Swarm> {
    return this.authService.user.pipe(
      take(1),
      switchMap((user) => {
        if (!user) {
          throw new Error('No user found');
        }

        return this.http.post<Swarm>(
          `https://beetracker-6865b.firebaseio.com/users/${user.id}/swarms.json?auth=${user.token}`,
          s
        );
      })
    );
  }
}
