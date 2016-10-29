import { Component } from '@angular/core'
import { AppState } from '../app.service'

@Component({
  selector: 'login',
  styleUrls: [ './login.component.css' ],
  templateUrl: './login.component.html',
})
export class LoginComponent {
  localState = { value: '' }

  constructor(public appState: AppState) {}
}
