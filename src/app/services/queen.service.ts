import { Injectable } from "@angular/core";
import { AngularFireDatabase } from "@angular/fire/database";
import { first, map, switchMap } from "rxjs/operators";
import { AuthService } from "../pages/auth/auth.service";

export interface QueenStatus {
  birthYear: number;
  lastSeen?: Date | string;
  eggsSeen?: Date | string;
}

@Injectable({
  providedIn: "root",
})
export class QueenService {
  constructor(
    private db: AngularFireDatabase,
    private authService: AuthService
  ) {}

  getStatus(colonyId: string) {
    return this.authService.getUser().pipe(
      first(),
      switchMap((user) => {
        return this.db
          .object(`/users/${user.uid}/queen/${colonyId}`)
          .valueChanges()
          .pipe(
            map((status: any) => {
              if (!status) {
                return null;
              }

              return {
                birthYear: status.birthYear,
                lastSeen: status.lastSeen ? new Date(status.lastSeen) : null,
                eggsSeen: status.eggsSeen ? new Date(status.eggsSeen) : null,
              };
            })
          );
      })
    );
  }

  saveStatus(colonyId: string, status: QueenStatus) {
    return this.authService.getUser().pipe(
      first(),
      switchMap((user) => {
        return this.db.object(`/users/${user.uid}/queen/${colonyId}`).update({
          birthYear: status.birthYear,
          lastSeen: status.lastSeen
            ? new Date(status.lastSeen).toISOString()
            : null,
          eggsSeen: status.eggsSeen
            ? new Date(status.eggsSeen).toISOString()
            : null,
        });
      })
    );
  }

  clearStatus(colonyId: string) {
    return this.authService.getUser().pipe(
      first(),
      switchMap((user) => {
        return this.db.object(`/users/${user.uid}/queen/${colonyId}`).remove();
      })
    );
  }
}
