import { Injectable } from '@angular/core'
import { Router, CanActivate } from '@angular/router'

import { AppState } from '../../app.service'

import 'rxjs/add/operator/do'

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    public appState: AppState,
    private router: Router,
  ) {}

  canActivate() {
    // todo: verify the token in Firebase
    let isLoggedIn: boolean = typeof this.appState.get('token') === 'string'
    if (!isLoggedIn) {
      this.router.navigateByUrl('/')
    }
    return isLoggedIn
  }
}
