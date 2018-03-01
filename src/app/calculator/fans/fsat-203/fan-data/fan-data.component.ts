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
  @Input()
  fanRatedInfo: FanRatedInfo;
  @Output('emitSave')
  emitSave = new EventEmitter<any>();
  @Output('emitSaveTraverse')
  emitSaveTraverse = new EventEmitter<any>();
  @Input()
  planeDataDone: boolean;
  @Input()
  plane1Done: boolean;
  @Input()
  plane2Done: boolean;
  @Input()
  plane3aDone: boolean;
  @Input()
  plane3bDone: boolean;
  @Input()
  plane3cDone: boolean;
  @Input()
  plane4Done: boolean;
  @Input()
  plane5Done: boolean;


  stepTab: string = '1';
  showReadings: boolean = false;
  constructor() { }

  ngOnInit() {
  }

  changeStepTab(str: string) {
    if(str != '3a' && str != '3b' && str != '3c' && this.showReadings){
      this.toggleReadings();
    }
    this.stepTab = str;
  }

  toggleReadings() {
    this.showReadings = !this.showReadings;
  }

  savePlane(plane: Plane, str: string){
    this.emitSave.emit({plane: plane, planeNumber: str})
  }

  saveTraversePlane(plane: Plane, str: string){
    this.emitSaveTraverse.emit({plane: plane, planeNumber: str})
  }
}
