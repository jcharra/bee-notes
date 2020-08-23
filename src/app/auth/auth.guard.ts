import { AuthService } from './auth.service';
import { Injectable } from '@angular/core';
import { CanLoad, Route, Router, UrlSegment } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

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
      .pipe(take(1), map((res: boolean) => {
        if (!res) {
          this.router.navigateByUrl('/auth');
        }
        return res;
      }));
  }
}
