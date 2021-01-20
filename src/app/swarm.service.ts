import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { Observable } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import { AuthService } from "./auth/auth.service";
import { JournalEntry } from "./journal.service";
import { ColonyStatusInfo } from "./status.service";

const DEFAULT_SORT_INDEX = 0;

export interface GeoPosition {
  displayName?: string;
  lat: number;
  lng: number;
}

export enum ActivityStatus {
  ACTIVE = "ACTIVE",
  DECEASED = "DECEASED",
  SOLD = "SOLD",
}

export interface Swarm {
  id?: string;
  name: string;
  created: Date;
  sortIndex: number;
  statusInfo?: ColonyStatusInfo;
  lastAction?: JournalEntry;
  activityStatus?: ActivityStatus;
}

@Injectable({
  providedIn: "root",
})
export class SwarmService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {}

  getSwarms(
    ignoreStatuses: ActivityStatus[] = [
      ActivityStatus.SOLD,
      ActivityStatus.DECEASED,
    ]
  ): Observable<Swarm[]> {
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

                if (ignoreStatuses.indexOf(value.activityStatus) > -1) {
                  continue;
                }

                swarms.push({
                  id: key,
                  name: value.name,
                  created: new Date(value.created),
                  sortIndex: value.sortIndex || DEFAULT_SORT_INDEX,
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
                sortIndex: s.sortIndex,
              };
            })
          );
      })
    );
  }

  createSwarm(name: string): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        const swarm = {
          name,
          created: new Date(),
          sortIndex: 0,
          activityStatus: ActivityStatus.ACTIVE,
        };

        return this.db
          .list(`/users/${user.uid}/swarms`)
          .push(swarm)
          .then((res: any) => {
            const pathParts = res.path.pieces_;
            return pathParts[pathParts.length - 1];
          });
      })
    );
  }

  updateSwarm(s: Swarm) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          id: s.id,
          name: s.name,
          created: s.created,
          sortIndex: s.sortIndex,
        });
      })
    );
  }

  markAsDeceased(s: Swarm): Observable<any> {
    return this.deactivate(s, ActivityStatus.DECEASED);
  }

  markAsSold(s: Swarm) {
    return this.deactivate(s, ActivityStatus.SOLD);
  }

  getFormerSwarms(): Observable<Swarm[]> {
    return this.getSwarms([ActivityStatus.ACTIVE]);
  }

  reactivate(s: Swarm) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          activityStatus: ActivityStatus.ACTIVE,
        });
      })
    );
  }

  private deactivate(s: Swarm, status: ActivityStatus) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          activityStatus: status,
        });
      })
    );
  }
}
