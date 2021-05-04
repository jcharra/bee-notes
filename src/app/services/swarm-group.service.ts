import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { switchMap, map, take } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";
import { Geolocation } from "@ionic-native/geolocation/ngx";
import { UISwarmGroup } from "../pages/swarms/swarms.page";

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
    private geolocation: Geolocation
  ) {}

  getGroups() {
    return this.authService.getUser().pipe(
      switchMap((user) => {
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
                const key = item.key;
                const value: any = item.payload.val();

                entries.push({
                  id: key,
                  name: value.name,
                  swarmIds: value.swarmIds,
                  lat: value.lat,
                  lng: value.lng,
                });
              }
              console.log("E: ", entries);
              return entries;
            })
          );
      })
    );
  }

  createGroup(name: string, swarmIds: string[] = []) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
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
        return this.db
          .object(`/users/${user.uid}/groups/${group.id}`)
          .update(group);
      })
    );
  }

  deleteGroup(gid: string) {
    return this.authService.getUser().pipe(
      switchMap((user) => {
        return this.db.object(`/users/${user.uid}/groups/${gid}`).remove();
      })
    );
  }

  setLocation(group: UISwarmGroup) {
    return this.geolocation
      .getCurrentPosition()
      .then((resp) => {
        return this.updateGroup({
          id: group.id,
          name: group.name,
          swarmIds: group.swarms.map((s) => s.id),
          lat: Math.round(resp.coords.latitude * 1000) / 1000,
          lng: Math.round(resp.coords.longitude * 1000) / 1000,
          //lat: Math.random() * 90 - 45,
          //lng: Math.random() * 90 - 45,
        }).subscribe();
      })
      .catch((error) => {
        console.log("Error getting location", error);
      });
  }
}
