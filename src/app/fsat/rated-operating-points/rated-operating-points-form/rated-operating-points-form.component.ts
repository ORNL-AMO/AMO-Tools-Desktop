import { Component, OnInit, Input } from '@angular/core';
import { RatedOperatingDataPoint } from '../rated-operating-points.component';
import { Settings } from 'http2';

@Component({
  selector: 'app-rated-operating-points-form',
  templateUrl: './rated-operating-points-form.component.html',
  styleUrls: ['./rated-operating-points-form.component.css']
})
export class RatedOperatingPointsFormComponent implements OnInit {
  @Input()
  point: RatedOperatingDataPoint;
  @Input()
  settings: Settings;

  options: Array<string> = [
    'Yes',
    'No'
  ]
  constructor() { }

  ngOnInit() {
  }
  
  save() {
    //todo
  }

  focusField(str: string) {
    //todo
  }
}
