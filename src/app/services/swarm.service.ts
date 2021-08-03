import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
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
    ignoreStatuses: ActivityStatus[] = [
      ActivityStatus.SOLD,
      ActivityStatus.DECEASED,
    ]
  ) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.storageSync
          .getFromStorage(user.uid, LocalStorageKey.SWARMS)
          .pipe(
            switchMap((localResultPromise) => {
              return from(localResultPromise).pipe(
                switchMap((localResult) => {
                  if (localResult) {
                    console.log("Local result:", localResult);
                    return of(localResult);
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

                            if (
                              ignoreStatuses.indexOf(value.activityStatus) > -1
                            ) {
                              continue;
                            }

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

                          this.writeSwarmsToStorage(user.uid, swarms);

                          return swarms;
                        })
                      );
                  }
                })
              );
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

  createSwarm(
    name: string,
    ancestorId: string = null,
    isNucleus: boolean = false,
    about: string = ""
  ): Observable<any> {
    return this.authService.getUser().pipe(
      switchMap(async (user) => {
        await this._markStorageAsDirty(user.uid);

        const swarm = {
          name,
          created: new Date(),
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
      map((user) => {
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

  getFormerSwarms(): Observable<Swarm[]> {
    return this.getSwarms([ActivityStatus.ACTIVE]);
  }

  reactivate(s: Swarm) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this._markStorageAsDirty(user.uid);
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          activityStatus: ActivityStatus.ACTIVE,
        });
      })
    );
  }

  private deactivate(s: Swarm, status: ActivityStatus) {
    return this.authService.getUser().pipe(
      switchMap(async (user) => {
        await this._markStorageAsDirty(user.uid);
        return this.db.object(`/users/${user.uid}/swarms/${s.id}`).update({
          activityStatus: status,
        });
      })
    );
  }

  private writeSwarmsToStorage(userId: string, swarms: Swarm[]) {
    this.storageSync.writeToStorage(userId, LocalStorageKey.SWARMS, swarms);
  }

  private _markStorageAsDirty(userId: string) {
    return this.storageSync.setCloudTimestamp(
      userId,
      LocalStorageKey.SWARMS,
      new Date()
    );
  }
}
