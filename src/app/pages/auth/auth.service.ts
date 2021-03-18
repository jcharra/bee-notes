import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Observable } from "rxjs";
import { first, tap } from "rxjs/operators";
export interface AuthResponseData {
  kind: string;
  idToken: string;
  email: string;
  refreshToken: string;
  localId: string;
  expiresIn: string;
  registered?: boolean;
}
export interface User {
  uid: string;
}
@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(
    private auth: AngularFireAuth,
    private router: Router,
    private toastController: ToastController,
    private translate: TranslateService
  ) {}

  getUser(): Observable<User> {
    return this.auth.user.pipe(
      first(),
      tap((u) => {
        if (!u) {
          this.router.navigateByUrl("/auth");
          throw new Error("Unauthorized");
        }
        return u;
      })
    );
  }

  signup(email: string, password: string) {
    return this.auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.auth.user.pipe(first()).subscribe((user) => {
          return user.sendEmailVerification();
        });
      });
  }

  login(email: string, password: string) {
    return this.auth
      .signInWithEmailAndPassword(email, password)
      .then((userCreds: any) => {
        if (!userCreds.user || !userCreds.user.emailVerified) {
          throw "User not yet verified";
        }
      });
  }

  logout() {
    this.auth.signOut();
  }

  resetPassword(email: string) {
    return this.auth.sendPasswordResetEmail(email);
  }

  deleteUser() {
    console.log("Delete user");
    this.auth.user.pipe(first()).subscribe((user) => {
      user
        .delete()
        .then(() => {
          this.router.navigateByUrl("/auth");
          this.goodbyeMessage();
        })
        .catch((err) => {
          this.onDeletionFailure();
        });
    });
  }

  async goodbyeMessage() {
    const toast = await this.toastController.create({
      message: this.translate.instant("AUTH_PAGE.goodbyeMessage"),
      duration: 6000,
    });
    toast.present();
  }

  async onDeletionFailure() {
    const toast = await this.toastController.create({
      message: this.translate.instant("AUTH_PAGE.deletionFailureHint"),
      duration: 6000,
    });
    toast.present();
  }
}
