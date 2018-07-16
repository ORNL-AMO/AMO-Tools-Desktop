import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, PlaneData, Plane } from '../../../../shared/models/fans';

import * as _ from 'lodash';
import { FsatService } from '../../../../fsat/fsat.service';
import { Settings } from '../../../../shared/models/settings';
import { Fsat203Service } from '../fsat-203.service';
import { FormGroup } from '../../../../../../node_modules/@angular/forms';

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
  emitSave = new EventEmitter<{ plane: Plane, planeNumber: string }>();
  @Output('emitSaveTraverse')
  emitSaveTraverse = new EventEmitter<{ plane: Plane, planeNumber: string }>();
  @Output('emitSavePlaneData')
  emitSavePlaneData = new EventEmitter<PlaneData>();
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
  @Input()
  inModal: boolean;
  @Input()
  settings: Settings;
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Output('emitChangePlane')
  emitChangePlane = new EventEmitter<string>();

  stepTab: string = 'plane-info';
  showReadings: boolean = false;
  velocityData: { pv3: number, percent75Rule: number };
  constructor(private fsatService: FsatService, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.velocityData = {
      pv3: 0,
      percent75Rule: 0
    }
  }

  changeStepTab(str: string) {
    if (str != '3a' && str != '3b' && str != '3c' && this.showReadings) {
      this.toggleReadings();
    }

    if (str == '3a') {
      this.calcVelocityData(this.planeData.FlowTraverse);
    }

    if (str == '3b') {
      this.calcVelocityData(this.planeData.AddlTraversePlanes[0]);
    }

    if (str == '3c') {
      this.calcVelocityData(this.planeData.AddlTraversePlanes[1]);
    }
    this.stepTab = str;
    this.emitChangePlane.emit(str);
    console.log('emit change : ' +  str);
  }

  toggleReadings() {
    this.showReadings = !this.showReadings;
  }

  savePlane(plane: Plane, str: string) {
    if (str == '3a' || str == '3b' || str == '3c') {
      this.calcVelocityData(plane);
    }
    this.emitSave.emit({ plane: plane, planeNumber: str })
  }

  calcVelocityData(plane: Plane) {
    let formObj: FormGroup = this.fsat203Service.getPlaneFormFromObj(plane);
    if (formObj.status == 'VALID') {
      this.velocityData = this.fsatService.getVelocityPressureData(plane, this.settings)
    } else {
      this.velocityData = { pv3: 0, percent75Rule: 0 }
    }
  }

  saveTraversePlane(plane: Plane, str: string) {
    this.calcVelocityData(plane);
    this.emitSaveTraverse.emit({ plane: plane, planeNumber: str })
  }

  savePlaneData(planeData: PlaneData) {
    this.emitSavePlaneData.emit(planeData);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }
}
