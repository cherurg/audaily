import { Component, NgZone } from '@angular/core';
import firebase from 'firebase'

import { AppState } from '../app.service';
import { Title } from './title';
import { XLarge } from './x-large';

interface AudioFile {
  data: string
  author: string
  name: string
}

@Component({
  // The selector is what angular internally uses
  // for `document.querySelectorAll(selector)` in our index.html
  // where, in this case, selector is the string 'home'
  selector: 'home',  // <home></home>
  // We need to tell Angular's Dependency Injection which providers are in our app.
  providers: [
    Title
  ],
  // Our list of styles in our component. We may add more to compose many styles together
  styleUrls: [ './home.component.css' ],
  // Every Angular template is first compiled by the browser before Angular runs it's compiler
  templateUrl: './home.component.html'
})
export class HomeComponent {
  public audios: AudioFile[] = []

  // Set our default values
  localState = { value: '' };
  // TypeScript public modifiers
  constructor(public appState: AppState, public title: Title, private zone: NgZone) {

  }

  ngOnInit() {
    console.log('hello `Home` component');
    firebase.database().ref('/audios').once('value').then((snapshot) => {
      this.zone.run(() => {
        this.audios = snapshot.val()
      })
    })
  }

  submitState(value: string) {
    console.log('submitState', value);
    this.appState.set('value', value);
    this.localState.value = '';
  }
}
