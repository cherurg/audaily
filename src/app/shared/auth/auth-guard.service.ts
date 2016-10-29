import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router'
import { Location } from '@angular/common'

import { AuthService } from './auth.service'

import 'rxjs/add/operator/do'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private authService: AuthService,
    private location: Location
  ) {}

  canActivate() {
    return this.authService.isLoggedIn()
      .do(loggedIn => {
        if (!loggedIn) {
          this.authService.redirectLocation = this.location.path()
          this.router.navigateByUrl('/login')
        }
      })
  }
}
