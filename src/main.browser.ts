/*
 * Angular bootstraping
 */
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { decorateModuleRef } from './app/environment';
import { bootloader } from '@angularclass/hmr';

import firebase from 'firebase'

let config = {
  apiKey: 'AIzaSyCcFAZHxNJdZjJohBAsjV2x4EAk1gei9CM',
  authDomain: 'long-read-fan.firebaseapp.com',
  databaseURL: 'https://long-read-fan.firebaseio.com',
  storageBucket: 'long-read-fan.appspot.com',
  messagingSenderId: '838839688601',
}

firebase.initializeApp(config)

/*
 * App Module
 * our top level module that holds all of our components
 */
import { AppModule } from './app';

/*
 * Bootstrap our Angular app with a top level NgModule
 */
export function main(): Promise<any> {
  return platformBrowserDynamic()
    .bootstrapModule(AppModule)
    .then(decorateModuleRef)
    .catch(err => console.error(err));
}

// needed for hmr
// in prod this is replace for document ready
bootloader(main);
