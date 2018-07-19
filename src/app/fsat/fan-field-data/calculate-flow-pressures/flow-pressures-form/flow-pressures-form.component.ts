import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FSAT, FanRatedInfo, PlaneData, Plane } from '../../../../shared/models/fans';
import { Fsat203Service } from '../../../../calculator/fans/fsat-203/fsat-203.service';
import { FormGroup } from '@angular/forms';
import { Settings } from '../../../../shared/models/settings';

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
  @Output('emitDataMissing')
  emitDataMissing = new EventEmitter<boolean>();
  @Output('emitFormSelect')
  emitFormSelect = new EventEmitter<string>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  @Output('emitChangePlane')
  emitChangePlane = new EventEmitter<string>();


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
  constructor(private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.checkAll();
    this.calculate();
  }

  checkAll() {
    this.checkPlane('1');
    this.checkPlane('2');
    this.checkPlane('3a');
    this.checkTraversePlanes();
    this.checkPlane('4');
    this.checkPlane('5');
    this.checkBasics();
  }

  goToForm(str: string) {
    this.formSelect = str;
    this.emitFormSelect.emit(str);
  }

  changeField(str: string){
    this.emitChangeField.emit(str);
  }

  changePlane(str: string){
    this.emitChangePlane.emit(str);
  }

  savePlaneData(data: PlaneData) {
    this.fsat.fieldData.planeData = data;
    this.calculate();
  }

  saveBasics(data: FanRatedInfo) {
    this.fsat.fieldData.fanRatedInfo = data;
    this.checkBasics();
    this.calculate();
  }

  updateBarometricPressure() {

  }

  savePlane(event: { planeNumber: string, plane: Plane }) {
    //logic for saving planes
    if (event.planeNumber == '1') {
      this.fsat.fieldData.planeData.FanInletFlange = event.plane;
      this.checkPlane(event.planeNumber);
    } else if (event.planeNumber == '2') {
      this.fsat.fieldData.planeData.FanEvaseOrOutletFlange = event.plane;
      this.checkPlane(event.planeNumber);
    } else if (event.planeNumber == '3a') {
      this.fsat.fieldData.planeData.FlowTraverse = event.plane;
      this.checkPlane('3a');
    } else if (event.planeNumber == '4') {
      this.fsat.fieldData.planeData.InletMstPlane = event.plane;
      this.checkPlane('4');
    } else if (event.planeNumber == '5') {
      this.fsat.fieldData.planeData.OutletMstPlane = event.plane;
      this.checkPlane('5');
    } else if (event.planeNumber == '3b' || event.planeNumber == '3c') {
      this.saveAddlTraversePlane(event);
    }
    this.calculate();
  }


  saveAddlTraversePlane(event: { planeNumber: string, plane: Plane }) {
    if (event.planeNumber == '3b') {
      this.fsat.fieldData.planeData.AddlTraversePlanes[0] = event.plane;
    } else if (event.planeNumber == '3c') {
      this.fsat.fieldData.planeData.AddlTraversePlanes[1] = event.plane;
    }
    this.checkTraversePlanes();
    this.calculate();
  }

  calculate() {
    if (this.basicsDone && this.planeDataDone) {
      this.emitCalculate.emit(this.fsat);
    } else {
      this.emitDataMissing.emit(true);
    }
  }

  checkPlane(planeNumber: string) {
    if (planeNumber == '1') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.FanInletFlange, this.settings);
      if (tmpForm.status == 'VALID') {
        this.plane1Done = true;
      } else {
        this.plane1Done = false;
      }
    } else if (planeNumber == '2') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.FanEvaseOrOutletFlange, this.settings);
      if (tmpForm.status == 'VALID') {
        this.plane2Done = true;
      } else {
        this.plane2Done = false;
      }
    } else if (planeNumber == '3a') {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.FlowTraverse, this.settings);
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.fsat.fieldData.planeData.FlowTraverse);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3aDone = true;
      } else {
        this.plane3aDone = false;
      }
    } else if (planeNumber == '4') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.InletMstPlane, this.settings);
      if (tmpForm.status == 'VALID') {
        this.plane4Done = true;
      } else {
        this.plane4Done = false;
      }
    } else if (planeNumber == '5') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.OutletMstPlane, this.settings);
      if (tmpForm.status == 'VALID') {
        this.plane5Done = true;
      } else {
        this.plane5Done = false;
      }
    }
    this.planeDataDone = this.plane1Done && this.plane2Done && this.plane3aDone && this.plane3bDone && this.plane4Done && this.plane5Done;
  }

  checkTraversePlanes() {
    if (this.fsat.fieldData.planeData.AddlTraversePlanes.length > 0) {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.AddlTraversePlanes[0], this.settings);
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.fsat.fieldData.planeData.AddlTraversePlanes[0]);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3bDone = true;
      } else {
        this.plane3bDone = false;
      }
    } else {
      this.plane3bDone = true;
    }
    if (this.fsat.fieldData.planeData.AddlTraversePlanes.length > 1) {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.fsat.fieldData.planeData.AddlTraversePlanes[1], this.settings);
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.fsat.fieldData.planeData.AddlTraversePlanes[1]);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3cDone = true;
      } else {
        this.plane3cDone = false;
      }
    } else {
      this.plane3cDone = true;
    }
  }


  checkBasics() {
    let tmpForm: FormGroup = this.fsat203Service.getBasicsFormFromObject(this.fsat.fieldData.fanRatedInfo, this.settings);
    if (tmpForm.status == 'VALID') {
      this.basicsDone = true;
    } else {
      this.basicsDone = false;
    }
  }
}
