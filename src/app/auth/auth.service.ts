import { Injectable, OnDestroy } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Plugins } from '@capacitor/core';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { User } from './user.model';

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
export class AuthService implements OnDestroy {
  private _user = new BehaviorSubject<User>(null);
  private activeLogoutTimer: any;

  get userIsAuthenticated() {
    return this._user.asObservable().pipe(map(user => {
      return user ? !!user.token : false;
    }));
  }

  get userId() {
    return this._user.asObservable().pipe(map(user => {
      return user ? user.id : null;
    }));
  }

  get token() {
    return this._user.asObservable().pipe(map(user => {
      return user ? user.token : null;
    }));
  }

  get user() {
    return this._user.asObservable();
  }

  constructor(private auth: AngularFireAuth) { }

  autoLogin() {
    return from(Plugins.Storage.get({ key: 'authData' }))
      .pipe(map(data => {
        if (!data || !data.value) {
          return null;
        }

        const parsedData = JSON.parse(data.value) as { email: string, token: string, tokenExpirationDate: string, userId: string };
        const expirationTime = new Date(parsedData.tokenExpirationDate);

        if (expirationTime <= new Date()) {
          return null;
        }

        return new User(parsedData.userId, parsedData.email, parsedData.token, expirationTime);
      }),
        tap(user => {
          if (user) {
            this._user.next(user);
            this.autoLogout(user.tokenDuration);
          }
        }),
        map(user => {
          return !!user;
        }));
  }

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

        this.setUserData(userCreds);
      });
  }

  logout() {
    Plugins.Storage.remove({ key: 'authData' })
    this.auth.signOut();
  }

  ngOnDestroy() {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }
  }

  private autoLogout(duration: number) {
    if (this.activeLogoutTimer) {
      clearTimeout(this.activeLogoutTimer);
    }

    this.activeLogoutTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  private async setUserData(res: firebase.auth.UserCredential) {
    if (res.user) {
      const user = res.user;
      const idTokenResult = await user.getIdTokenResult();

      const localUser = new User(user.uid, user.email, idTokenResult.token, new Date(idTokenResult.expirationTime));
      this._user.next(localUser);
      this.autoLogout(localUser.tokenDuration);
      this.storeAuthData(user.uid, localUser.email, localUser.token, idTokenResult.expirationTime);
    }
  }

  private storeAuthData(userId: string, email: string, token: string, tokenExpirationDate: string) {
    const data = { userId, token, tokenExpirationDate, email };
    Plugins.Storage.set({ key: 'authData', value: JSON.stringify(data) });
  }
}

@Injectable({ providedIn: 'root' })
export class UserResolver implements Resolve<string> {
  constructor(private service: AuthService) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<string> {
    return this.service.userId.pipe(
      tap(userId => {
        console.log('Resolved Id is ', userId);
      })
    );
  }
}