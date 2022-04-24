import { Injectable } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "@angular/fire/auth";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { EMPTY, Observable, of } from "rxjs";
import { StorageSyncService } from "src/app/services/storage-sync.service";
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
    private auth: Auth,
    private router: Router,
    private toastController: ToastController,
    private translate: TranslateService,
    private storageSync: StorageSyncService
  ) {}

  getUser(): Observable<User> {
    const u = this.auth.currentUser;
    if (!u) {
      return EMPTY;
    }
    return of(u);
  }

  signup(email: string, password: string) {
    return createUserWithEmailAndPassword(this.auth, email, password).then((result) => {
      return sendEmailVerification(result.user);
    });
  }

  login(email: string, password: string) {
    return signInWithEmailAndPassword(this.auth, email, password).then((userCreds: any) => {
      if (!userCreds.user || !userCreds.user.emailVerified) {
        throw "User not yet verified";
      }
    });
  }

  async logout() {
    await this.auth.signOut();
    await this.storageSync.clearStorage();
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  deleteUser(password) {
    const user = this.auth.currentUser;

    if (!user) {
      console.log("No user found");
      return;
    }

    return reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password))
      .then(() => {
        user.delete().then(() => {
          this.router.navigateByUrl("/auth");
          this.goodbyeMessage();
        });
      })
      .catch(() => this.onDeletionFailure());
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
