import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable, of } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanLoad {

  constructor(private authService: AuthService,
    private router: Router) {

  }

  canLoad(route: Route, segments: UrlSegment[]): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService
      .userIsAuthenticated
      .pipe(
        take(1),
        switchMap((isAuthenticated: boolean) => {
          if (!isAuthenticated) {
            return this.authService.autoLogin();
          } else {
            return of(isAuthenticated);
          }
        }),
        tap((isAuthenticated: boolean) => {
          if (!isAuthenticated) {
            this.router.navigateByUrl('/auth');
          }
        }));
  }
}
