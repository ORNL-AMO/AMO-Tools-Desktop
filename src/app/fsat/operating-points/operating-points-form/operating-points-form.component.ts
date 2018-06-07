import { Component, OnInit, Input } from '@angular/core';
import { OperatingDataPoint } from '../operating-points.component';
import { Settings } from '../../../shared/models/settings';


@Component({
  selector: 'app-operating-points-form',
  templateUrl: './operating-points-form.component.html',
  styleUrls: ['./operating-points-form.component.css']
})
export class OperatingPointsFormComponent implements OnInit {
  @Input()
  point: OperatingDataPoint;
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
