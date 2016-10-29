import { Component, Input } from '@angular/core'

@Component({
  selector: 'record',
  templateUrl: './record.component.html',
  styleUrls: [ './record.component.css' ],
})
export class RecordComponent {
  @Input() audio
}
