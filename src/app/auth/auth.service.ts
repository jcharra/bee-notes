import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';

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
  providedIn: 'root'
})
export class AuthService {
  constructor(private auth: AngularFireAuth) { }

  signup(email: string, password: string) {
    return this.auth
      .createUserWithEmailAndPassword(email, password)
      .then(() => {
        this.auth.user
          .subscribe(user => {
            return user.sendEmailVerification();
          })
      });
  }

  login(email: string, password: string) {
    return this.auth
      .signInWithEmailAndPassword(email, password)
      .then((userCreds: firebase.auth.UserCredential) => { 
        if (!userCreds.user || !userCreds.user.emailVerified) {
          throw 'User not yet verified';
        }
      });
  }

  logout() {
    this.auth.signOut();
  }
}