import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { JournalEntry } from "./journal.service";
import { ColonyStatusInfo } from "./status.service";

export interface GeoPosition {
  displayName?: string;
  lat: number;
  lng: number;
}

export interface Swarm {
  id?: string;
  name: string;
  created: Date;
  position?: GeoPosition;
  statusInfo?: ColonyStatusInfo;
  lastAction?: JournalEntry;
  sortIndex?: number;
}

@Injectable({
  providedIn: "root",
})
export class SwarmService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {}

  getSwarms(): Observable<Swarm[]> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
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
                  position: value.position,
                  created: new Date(value.created),
                  sortIndex: value.sortIndex,
                });
              }
              return swarms;
            })
          );
      })
    );
  }

  getSwarm(id: string): Observable<Swarm> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db
          .object(`users/${user.uid}/swarms/${id}`)
          .valueChanges()
          .pipe(
            take(1),
            map((s: any) => {
              return {
                id,
                name: s.name,
                created: new Date(s.created),
                position: s.position,
                sortIndex: s.sortIndex,
              };
            })
          );
      })
    );
  }

  createSwarm(s: Swarm): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db.list(`/users/${user.uid}/swarms`).push(s);
      })
    );
  }
}
