import { Component } from '@angular/core'
import { Router } from '@angular/router'
import firebase from 'firebase'

import { AppState } from '../app.service'

@Component({
  selector: 'landing',
  templateUrl: './landing.component.html',
  styleUrls: [ './landing.component.css' ]
})
export class LandingComponent {
  constructor(
    public appState: AppState,
    public router: Router,
  ) {}

  login() {
    let provider = new firebase.auth.GoogleAuthProvider()
    firebase.auth().signInWithPopup(provider)
      .then((result) => {
        this.appState.set('user', result.user)
        this.appState.set('token', result.credential.accessToken)
        this.router.navigateByUrl('/home')
      })
      .catch((error: any) => {
        console.error(error.code)
        console.error(error.message)
      })
  }
}
