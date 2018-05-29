import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FSAT, FanRatedInfo, PlaneData, Plane } from '../../../../shared/models/fans';
import { Settings } from 'electron';

@Component({
  selector: 'app-flow-pressures-form',
  templateUrl: './flow-pressures-form.component.html',
  styleUrls: ['./flow-pressures-form.component.css']
})
export class FlowPressuresFormComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<FSAT>();


  formSelect: string = 'none';
  basicsDone: boolean;
  planeDataDone: boolean;
  plane1Done: boolean;
  plane2Done: boolean;
  plane3aDone: boolean;
  plane3bDone: boolean;
  plane3cDone: boolean;
  plane4Done: boolean;
  plane5Done: boolean;
  constructor() { }

  ngOnInit() {
  }

  goToForm(str: string) {
    this.formSelect = str;
  }

  savePlaneData(data: PlaneData) {
    this.fsat.fieldData.planeData = data;
    this.calculate();
  }

  saveBasics(data: FanRatedInfo) {
    this.fsat.fieldData.fanRatedInfo = data;
    this.calculate();
  }

  updateBarometricPressure() {

  }

  savePlane(event: { planeNumber: string, plane: Plane }) {
    //logic for saving planes
    if (event.planeNumber == '1') {
      this.fsat.fieldData.planeData.FanInletFlange = event.plane;
      // this.checkPlane(event.planeNumber);
    } else if (event.planeNumber == '2') {
      this.fsat.fieldData.planeData.FanEvaseOrOutletFlange = event.plane;
      //  this.checkPlane(event.planeNumber);
    } else if (event.planeNumber == '3a') {
      this.fsat.fieldData.planeData.FlowTraverse = event.plane;
      // this.checkPlane('3a');
    } else if (event.planeNumber == '4') {
      this.fsat.fieldData.planeData.InletMstPlane = event.plane;
      //  this.checkPlane('4');
    } else if (event.planeNumber == '5') {
      this.fsat.fieldData.planeData.OutletMstPlane = event.plane;
      // this.checkPlane('5');
    }
    this.calculate();
  }


  saveAddlTraversePlane(event: { planeNumber: string, plane: Plane }) {
    if (event.planeNumber == '3b') {
      this.fsat.fieldData.planeData.AddlTraversePlanes[0] = event.plane;
    } else if (event.planeNumber == '3c') {
      this.fsat.fieldData.planeData.AddlTraversePlanes[1] = event.plane;
    }
    this.calculate();
  }

  calculate() {
    this.emitCalculate.emit(this.fsat);
  }

}
