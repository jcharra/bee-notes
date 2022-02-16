import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/compat/database";
import { switchMap, map, take } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { UISwarmGroup } from "../pages/swarms/swarms.page";
import { LocalStorageKey, StorageSyncService } from "./storage-sync.service";
import { from, of } from "rxjs";

export interface SwarmGroup {
  id: string;
  name: string;
  swarmIds: string[];
  lat?: number;
  lng?: number;
}

@Injectable({
  providedIn: "root",
})
export class SwarmGroupService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService,
    private geolocation: Geolocation,
    private storageSync: StorageSyncService
  ) {}

  getGroups() {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return from(this.storageSync.getFromStorage(LocalStorageKey.GROUPS)).pipe(
          switchMap((localGroups) => {
            if (localGroups) {
              return of(localGroups);
            } else {
              return this.db
                .list(`/users/${user.uid}/groups`)
                .snapshotChanges()
                .pipe(
                  take(1),
                  map((data: any[]) => {
                    if (!data) {
                      return [];
                    }

                    const entries: SwarmGroup[] = [];
                    for (let i = 0; i < data.length; i++) {
                      const item: any = data[i];
                      entries.push(this._entryFromFbValue(item));
                    }

                    this.storageSync.writeToStorage(LocalStorageKey.GROUPS, entries);

                    return entries;
                  })
                );
            }
          })
        );
      })
    );
  }

  getGroup(groupId: string) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db
          .object(`/users/${user.uid}/groups/${groupId}`)
          .snapshotChanges()
          .pipe(
            take(1),
            map((data: any) => {
              if (!data) {
                return null;
              }

              return this._entryFromFbValue(data);
            })
          );
      })
    );
  }

  createGroup(name: string, swarmIds: string[] = []) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this._markStorageAsDirty();
        return this.db.list(`/users/${user.uid}/groups`).push({
          name,
          swarmIds,
        });
      })
    );
  }

  updateGroup(group: SwarmGroup) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this._markStorageAsDirty();
        return this.db.object(`/users/${user.uid}/groups/${group.id}`).update(group);
      })
    );
  }

  addSwarmToGroup(swarmId: string, groupId: string) {
    return this.getGroup(groupId).pipe(
      switchMap((g: SwarmGroup) => {
        this._markStorageAsDirty();
        if (!g) {
          return;
        }

        const newSwarmIds = (g.swarmIds || []).concat(swarmId);
        return this.updateGroup({
          id: g.id,
          name: g.name,
          swarmIds: newSwarmIds,
        });
      })
    );
  }

  deleteGroup(gid: string) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        this._markStorageAsDirty();
        return this.db.object(`/users/${user.uid}/groups/${gid}`).remove();
      })
    );
  }

  setLocation(group: UISwarmGroup) {
    return this.geolocation.getCurrentPosition().then((resp) => {
      return this.updateGroup({
        id: group.id,
        name: group.name,
        swarmIds: group.swarms.map((s) => s.id),
        lat: Math.round(resp.coords.latitude * 1000) / 1000,
        lng: Math.round(resp.coords.longitude * 1000) / 1000,
        //lat: Math.random() * 90 - 45,
        //lng: Math.random() * 90 - 45,
      }).subscribe();
    });
  }

  private _entryFromFbValue(data: any) {
    const key = data.key;
    const value: any = data.payload.val();

    let entry: SwarmGroup = {
      id: key,
      name: value.name,
      swarmIds: value.swarmIds,
    };

    if (value.lat) {
      entry.lat = value.lat;
    }

    if (value.lng) {
      entry.lng = value.lng;
    }

    return entry;
  }

  private _markStorageAsDirty(): Promise<any> {
    return this.storageSync.clearFromStorage(LocalStorageKey.GROUPS);
  }
}
