import { Component, Input, NgZone } from '@angular/core'
import firebase from 'firebase'

@Component({
  selector: 'record',
  templateUrl: './record.component.html',
  styleUrls: [ './record.component.css' ],
})
export class RecordComponent {
  @Input() audio

  url: string

  constructor(public zone: NgZone) {}

  ngOnInit() {
    let storage = firebase.storage()
    let ref = storage.ref()
    ref.child(this.audio.url).getDownloadURL()
      .then(url => {
        this.zone.run(() => {
          console.log(url)
          this.url = url
        })
      })
  }
}
