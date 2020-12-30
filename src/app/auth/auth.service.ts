import { Injectable } from "@angular/core";
import { AngularFireAuth } from "@angular/fire/auth";
import { Router } from "@angular/router";
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

@Injectable({
  providedIn: "root",
})
export class AuthService {
  constructor(private auth: AngularFireAuth, private router: Router) {}

  getUser(): Observable<firebase.User> {
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
      .then((userCreds: firebase.auth.UserCredential) => {
        if (!userCreds.user || !userCreds.user.emailVerified) {
          throw "User not yet verified";
        }
      });
  }

  logout() {
    this.auth.signOut();
  }

  resetPassword(email: string) {
    this.auth.sendPasswordResetEmail(email);
  }
}
