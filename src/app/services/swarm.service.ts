import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { from, Observable, of } from "rxjs";
import { map, switchMap, take } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";
import { ActivityStatus, Swarm } from "../types/Swarm";
import { LocalStorageKey, StorageSyncService } from "./storage-sync.service";

@Injectable({
  providedIn: "root",
})
export class SwarmService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private storageSync: StorageSyncService
  ) {}

  getSwarms(
    ignoreStatuses: ActivityStatus[] = [ActivityStatus.SOLD, ActivityStatus.DECEASED, ActivityStatus.DISSOLVED]
  ) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        console.log("User", user.uid);
        return from(this.storageSync.getFromStorage(LocalStorageKey.SWARMS)).pipe(
          switchMap((localResult) => {
            if (localResult) {
              return of(localResult).pipe(
                take(1),
                map((swarms: Swarm[]) => {
                  return swarms
                    .map((s) => {
                      return { ...s, created: new Date(s.created) };
                    })
                    .filter((s) => ignoreStatuses.indexOf(s.activityStatus) === -1);
                })
              );
            } else {
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
                        activityStatus: value.activityStatus,
                        ancestorId: value.ancestorId,
                        isNucleus: value.isNucleus,
                        about: value.about,
                      });
                    }

                    this.writeSwarmsToStorage(swarms);

                    return swarms.filter((s) => ignoreStatuses.indexOf(s.activityStatus) === -1);
                  })
                );
            }
          })
        );
      })
    );
  }

  getSwarm(swarmId: string): Observable<Swarm> {
    return from(this.storageSync.getFromStorage(LocalStorageKey.SWARMS)).pipe(
      switchMap((localSwarms) => {
        const swarmForId = localSwarms ? localSwarms.filter((s) => s.id === swarmId)[0] : null;
        if (swarmForId) {
          return of(swarmForId);
        } else {
          return this.authService.getUser().pipe(
            switchMap((user) => {
              return this.db
                .object(`users/${user.uid}/swarms/${swarmId}`)
                .valueChanges()
                .pipe(
                  take(1),
                  map((s: any) => {
                    return {
                      id: swarmId,
                      name: s.name,
                      created: new Date(s.created),
                      activityStatus: s.activityStatus,
                      ancestorId: s.ancestorId,
                      isNucleus: s.isNucleus,
                      about: s.about,
                    };
                  })
                );
            })
          );
        }
      })
    );
  }

  createSwarm(
    name: string,
    ancestorId: string = null,
    isNucleus: boolean = false,
    about: string = ""
  ): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap(async (user) => {
        await this._markStorageAsDirty();

        const swarm = {
          name,
          created: new Date().toISOString(),
          activityStatus: ActivityStatus.ACTIVE,
          ancestorId,
          isNucleus,
          about,
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
      map(async (user) => {
        await this._markStorageAsDirty();
        this.db.object(`/users/${user.uid}/swarms/${s.id}`).update(s);
      })
    );
  }

  markAsDeceased(s: Swarm): Observable<any> {
    return this.deactivate(s, ActivityStatus.DECEASED);
  }

  markAsSold(s: Swarm) {
    return this.deactivate(s, ActivityStatus.SOLD);
  }

  markAsDissolved(s: Swarm) {
    return this.deactivate(s, ActivityStatus.DISSOLVED);
  }

  getFormerSwarms(): Observable<Swarm[]> {
    return this.getSwarms([ActivityStatus.ACTIVE]);
  }

  reactivate(s: Swarm) {
    return this.authService.getUser().pipe(
      switchMap(async (user) => {
        await this._markStorageAsDirty();
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          activityStatus: ActivityStatus.ACTIVE,
        });
      })
    );
  }

  private deactivate(s: Swarm, status: ActivityStatus) {
    return this.authService.getUser().pipe(
      switchMap(async (user) => {
        await this._markStorageAsDirty();
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          activityStatus: status,
        });
      })
    );
  }

  private writeSwarmsToStorage(swarms: Swarm[]) {
    this.storageSync.writeToStorage(
      LocalStorageKey.SWARMS,
      swarms.map((s) => {
        let date = null;
        try {
          date = new Date(s.created).toISOString();
        } catch {}

        return { ...s, created: date };
      })
    );
  }

  private _markStorageAsDirty(): Promise<any> {
    return this.storageSync.clearStorage();
  }
}
