import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { addSeconds } from 'date-fns';
import { BehaviorSubject } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
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

  constructor(private http: HttpClient) { }

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
      this._user.next(new User(res.localId, res.email, res.idToken, addSeconds(new Date(), +res.expiresIn)));
    }
  }
}
