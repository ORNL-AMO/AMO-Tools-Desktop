import { Component, OnInit } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, BaseGasDensity, Plane, Fan203Results, FanShaftPower } from '../../../shared/models/fans';
import { FsatService } from '../../../fsat/fsat.service';
import { Fsat203Service } from './fsat-203.service';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-fsat-203',
  templateUrl: './fsat-203.component.html',
  styleUrls: ['./fsat-203.component.css']
})
export class Fsat203Component implements OnInit {
  tabSelect: string = 'results';
  inputs: Fan203Inputs;
  basicsDone: boolean = false;
  gasDone: boolean = false;
  formSelect: string = 'none';
  planeDataDone: boolean = false;
  plane1Done: boolean = false;
  plane2Done: boolean = false;
  plane3aDone: boolean = false;
  plane3bDone: boolean = false;
  plane4Done: boolean = false;
  plane5Done: boolean = false;
  shaftPowerDone: boolean = false;

  results: Fan203Results;
  constructor(private fsatService: FsatService, private fsat203Service: Fsat203Service) { }

  ngOnInit() {
    this.inputs = this.fsat203Service.getMockData();
    this.checkBasics();
    this.checkGasDensity();
    this.checkPlane('1');
    this.checkPlane('2');
    this.checkPlane('3a');
    this.checkPlane('3b');
    this.checkPlane('4');
    this.checkPlane('5');
    this.checkShaftPower();
    this.calculate();
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    if (this.planeDataDone && this.basicsDone && this.gasDone && this.shaftPowerDone) {
      this.results = this.fsatService.fan203(this.inputs);
    } else {
      this.results = {
        fanEfficiencyTotalPressure: 0,
        fanEfficiencyStaticPressure: 0,
        fanEfficiencyStaticPressureRise: 0,
        flowCorrected: 0,
        pressureTotalCorrected: 0,
        pressureStaticCorrected: 0,
        staticPressureRiseCorrected: 0,
        powerCorrected: 0,
        kpc: 0
      }
    }
  }

  checkBasics() {
    let tmpForm: FormGroup = this.fsat203Service.getBasicsFormFromObject(this.inputs.FanRatedInfo);
    if (tmpForm.status == 'VALID') {
      this.basicsDone = true;
    } else {
      this.basicsDone = false;
    }
  }

  saveBasics(info: FanRatedInfo) {
    this.inputs.FanRatedInfo = info;
    this.checkBasics();
    this.calculate();
  }

  checkGasDensity() {
    let tmpForm: FormGroup = this.fsat203Service.getGasDensityFormFromObj(this.inputs.BaseGasDensity);
    if (tmpForm.status == 'VALID') {
      this.gasDone = true;
    } else {
      this.gasDone = false;
    }
  }

  saveDensity(density: BaseGasDensity) {
    this.inputs.BaseGasDensity = density;
    this.checkGasDensity();
    this.calculate();
  }

  checkPlane(planeNumber: string) {
    if (planeNumber == '1') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.FanInletFlange);
      if (tmpForm.status == 'VALID') {
        this.plane1Done = true;
      } else {
        this.plane1Done = false;
      }
    } else if (planeNumber == '2') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.FanEvaseOrOutletFlange);
      if (tmpForm.status == 'VALID') {
        this.plane2Done = true;
      } else {
        this.plane2Done = false;
      }
    } else if (planeNumber == '3a') {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.FlowTraverse);
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.inputs.PlaneData.FlowTraverse);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3aDone = true;
      } else {
        this.plane3aDone = false;
      }
    } else if (planeNumber == '3b') {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.AddlTraversePlanes[0]);
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.inputs.PlaneData.AddlTraversePlanes[0]);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3bDone = true;
      } else {
        this.plane3bDone = false;
      }
    } else if (planeNumber == '4') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.InletMstPlane);
      if (tmpForm.status == 'VALID') {
        this.plane4Done = true;
      } else {
        this.plane4Done = false;
      }
    } else if (planeNumber == '5') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.OutletMstPlane);
      if (tmpForm.status == 'VALID') {
        this.plane5Done = true;
      } else {
        this.plane5Done = false;
      }
    }
    this.planeDataDone = this.plane1Done && this.plane2Done && this.plane3aDone && this.plane3bDone && this.plane4Done && this.plane5Done;
  }


  savePlane(event: { planeNumber: string, plane: Plane }) {
    //logic for saving planes
    if (event.planeNumber == '1') {
      this.inputs.PlaneData.FanInletFlange = event.plane;
      this.checkPlane(event.planeNumber);
    } else if (event.planeNumber == '2') {
      this.inputs.PlaneData.FanEvaseOrOutletFlange = event.plane;
      this.checkPlane(event.planeNumber);
    } else if (event.planeNumber == '3a') {
      this.inputs.PlaneData.FlowTraverse = event.plane;
      this.checkPlane('3a');
    } else if (event.planeNumber == '3b') {
      this.inputs.PlaneData.AddlTraversePlanes[0] = event.plane;
      this.checkPlane('3b');
    } else if (event.planeNumber == '4') {
      this.inputs.PlaneData.InletMstPlane = event.plane;
      this.checkPlane('4');
    } else if (event.planeNumber == '5') {
      this.inputs.PlaneData.OutletMstPlane = event.plane;
      this.checkPlane('5');
    }
    this.calculate();
  }

  checkShaftPower() {
    let tmpForm: FormGroup = this.fsat203Service.getShaftPowerFormFromObj(this.inputs.FanShaftPower);
    if (tmpForm.status == 'VALID') {
      this.shaftPowerDone = true;
    } else {
      this.shaftPowerDone = false;
    }
  }

  saveShaftPower(shaftPower: FanShaftPower) {
    this.inputs.FanShaftPower = shaftPower;
    this.checkShaftPower();
    this.calculate();
  }

  goToForm(str: string) {
    this.formSelect = str;
  }
}
