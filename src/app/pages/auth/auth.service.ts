import { Injectable } from "@angular/core";
import {
  Auth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
} from "@angular/fire/auth";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { TranslateService } from "@ngx-translate/core";
import { Observable, of } from "rxjs";
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
      console.error("UNAUTHORIZED - back to login");
      this.router.navigateByUrl("/auth");
      throw new Error("Unauthorized");
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

  logout() {
    this.auth.signOut();
    this.storageSync.clearStorage();
  }

  resetPassword(email: string) {
    return sendPasswordResetEmail(this.auth, email);
  }

  deleteUser(password) {
    /*
    return this.auth.user.pipe(first()).subscribe((user) => {
      return user
        .reauthenticateWithCredential(EmailAuthProvider.credential(user.email, password))
        .then(() => {
          user.delete().then(() => {
            this.router.navigateByUrl("/auth");
            this.goodbyeMessage();
          });
        })
        .catch(() => this.onDeletionFailure());
    });
    */
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
