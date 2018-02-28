import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, PlaneData, Plane } from '../../../../shared/models/fans';

import * as _ from 'lodash';
@Component({
  selector: 'app-fan-data',
  templateUrl: './fan-data.component.html',
  styleUrls: ['./fan-data.component.css']
})
export class FanDataComponent implements OnInit {
  @Input()
  planeData: PlaneData;
  @Output('emitSave')
  emitSave = new EventEmitter<any>();
  @Input()
  planeDataDone: boolean;

  stepTab: string = '1';
  showReadings: boolean = false;
  constructor() { }

  ngOnInit() { 
  }

  changeStepTab(str: string) {
    this.stepTab = str;
  }

  toggleReadings() {
    this.showReadings = !this.showReadings;
  }

  savePlane(plane: Plane, str: string){
    this.emitSave.emit({plane: plane, planeNumber: str})
  }
}
