import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { addSeconds } from 'date-fns';
import { BehaviorSubject, from, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { User } from './user.model';
import { Plugins } from '@capacitor/core';

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
  private _user = new BehaviorSubject<User>(null);

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

  constructor(private http: HttpClient) { }

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
          }
        }),
        map(user => {
          return !!user;
        }));
  }

  signup(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${environment.FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true
        })
      .pipe(tap(this.setUserData.bind(this)));
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponseData>(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${environment.FIREBASE_API_KEY}`,
        {
          email,
          password,
          returnSecureToken: true
        })
      .pipe(tap(this.setUserData.bind(this)));
  }

  logout() {
    this._user.next(null);
  }

  private setUserData(res: AuthResponseData) {
    if (res.idToken && res.localId) {
      const expirationDate = addSeconds(new Date(), +res.expiresIn);
      this._user.next(new User(res.localId, res.email, res.idToken, expirationDate));
      this.storeAuthData(res.localId, res.email, res.idToken, expirationDate.toISOString());
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