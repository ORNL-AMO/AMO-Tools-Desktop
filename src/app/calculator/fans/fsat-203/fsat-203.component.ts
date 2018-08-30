import { Component, OnInit, Input, ViewChild, HostListener, ElementRef } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, BaseGasDensity, Plane, Fan203Results, FanShaftPower, PlaneData, PlaneResults } from '../../../shared/models/fans';
import { FsatService } from '../../../fsat/fsat.service';
import { Fsat203Service } from './fsat-203.service';
import { FormGroup } from '@angular/forms';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Settings } from '../../../shared/models/settings';
import { SettingsDbService } from '../../../indexedDb/settings-db.service';
import { ConvertFsatService } from '../../../fsat/convert-fsat.service';

@Component({
  selector: 'app-fsat-203',
  templateUrl: './fsat-203.component.html',
  styleUrls: ['./fsat-203.component.css']
})
export class Fsat203Component implements OnInit {
  @Input()
  settings: Settings;

  @ViewChild('leftPanelHeader') leftPanelHeader: ElementRef;

  @HostListener('window:resize', ['$event'])
  onResize(event) {
    this.resizeTabs();
  }

  headerHeight: number;


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
  plane3cDone: boolean = false;
  plane4Done: boolean = false;
  plane5Done: boolean = false;
  shaftPowerDone: boolean = false;

  results: Fan203Results;
  planeResults: PlaneResults;
  currentField: string;
  currentPlane: string = 'plane-info';
  constructor(private fsatService: FsatService, private fsat203Service: Fsat203Service, private settingsDbService: SettingsDbService, private convertFsatService: ConvertFsatService) { }

  ngOnInit() {
    if (!this.settings) {
      this.settings = this.settingsDbService.globalSettings;
    }
    this.inputs = this.fsat203Service.inputData;
    if (this.inputs == undefined) {
      this.inputs = this.fsat203Service.getDefaultData();
      this.inputs = this.convertFsatService.convertFan203Inputs(this.inputs, this.settings);
    }
    this.checkBasics();
    this.checkGasDensity();
    this.checkPlane('1');
    this.checkPlane('2');
    this.checkPlane('3a');
    this.checkTraversePlanes();
    this.checkPlane('4');
    this.checkPlane('5');
    this.checkShaftPower();
    this.calculate();
  }
  ngAfterViewInit() {
    setTimeout(() => {
      this.resizeTabs();
    }, 100);
  }

  ngOnDestroy(){
    this.fsat203Service.inputData = this.inputs;
  }

  resizeTabs() {
    if (this.leftPanelHeader.nativeElement.clientHeight) {
      this.headerHeight = this.leftPanelHeader.nativeElement.clientHeight;
    }
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  calculate() {
    if (this.planeDataDone && this.basicsDone && this.gasDone && this.shaftPowerDone) {
      this.planeResults = this.fsatService.getPlaneResults(this.inputs, this.settings);
      this.results = this.fsatService.fan203(this.inputs, this.settings);
      // this.results.fanEfficiencyStaticPressure = this.results.fanEfficiencyStaticPressure;
      // this.results.fanEfficiencyStaticPressureRise = this.results.fanEfficiencyStaticPressureRise;
      // this.results.fanEfficiencyTotalPressure = this.results.fanEfficiencyTotalPressure;
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
    let tmpForm: FormGroup = this.fsat203Service.getBasicsFormFromObject(this.inputs.FanRatedInfo, this.settings);
    if (tmpForm.status == 'VALID') {
      this.basicsDone = true;
    } else {
      this.basicsDone = false;
    }
  }

  saveBasics(info: FanRatedInfo) {
    if (info.traversePlanes != this.inputs.FanRatedInfo.traversePlanes) {
      this.setTraversePlanes(info.traversePlanes);
    }
    this.inputs.FanRatedInfo = info;
    this.checkBasics();
    this.calculate();
  }

  updateBarometricPressure(info: FanRatedInfo) {
    this.saveBasics(info);
    this.inputs.PlaneData.FanInletFlange.barometricPressure = info.globalBarometricPressure;
    this.checkPlane('1');
    this.inputs.PlaneData.FanEvaseOrOutletFlange.barometricPressure = info.globalBarometricPressure;
    this.checkPlane('2');
    this.inputs.PlaneData.FlowTraverse.barometricPressure = info.globalBarometricPressure;
    this.checkPlane('3a');
    let i: number = 1;
    this.inputs.PlaneData.AddlTraversePlanes.forEach(plane => {
      plane.barometricPressure = info.globalBarometricPressure;
      this.checkTraversePlanes();
    })
    this.inputs.PlaneData.InletMstPlane.barometricPressure = info.globalBarometricPressure;
    this.checkPlane('4');
    this.inputs.PlaneData.OutletMstPlane.barometricPressure = info.globalBarometricPressure;
    this.checkPlane('5');
  }

  checkGasDensity() {
    let tmpForm: FormGroup = this.fsat203Service.getGasDensityFormFromObj(this.inputs.BaseGasDensity, this.settings);
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

  setTraversePlanes(num: number) {
    if (num == 1) {
      this.inputs.PlaneData.AddlTraversePlanes = [];
    } else if (num == 2) {
      this.inputs.PlaneData.AddlTraversePlanes = [
        this.getMockTraversePlane()
      ];
    } else if (num == 3) {
      this.inputs.PlaneData.AddlTraversePlanes = [
        this.getMockTraversePlane(),
        this.getMockTraversePlane()
      ];
    }
    this.checkTraversePlanes();
  }

  checkPlane(planeNumber: string) {
    if (planeNumber == '1') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.FanInletFlange, this.settings, planeNumber);
      if (tmpForm.status == 'VALID') {
        this.plane1Done = true;
      } else {
        this.plane1Done = false;
      }
    } else if (planeNumber == '2') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.FanEvaseOrOutletFlange, this.settings, planeNumber);
      if (tmpForm.status == 'VALID') {
        this.plane2Done = true;
      } else {
        this.plane2Done = false;
      }
    } else if (planeNumber == '3a') {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.FlowTraverse, this.settings, planeNumber);
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.inputs.PlaneData.FlowTraverse);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3aDone = true;
      } else {
        this.plane3aDone = false;
      }
    } else if (planeNumber == '4') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.InletMstPlane, this.settings, planeNumber);
      if (tmpForm.status == 'VALID') {
        this.plane4Done = true;
      } else {
        this.plane4Done = false;
      }
    } else if (planeNumber == '5') {
      let tmpForm: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.OutletMstPlane, this.settings, planeNumber);
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
    } else if (event.planeNumber == '4') {
      this.inputs.PlaneData.InletMstPlane = event.plane;
      this.checkPlane('4');
    } else if (event.planeNumber == '5') {
      this.inputs.PlaneData.OutletMstPlane = event.plane;
      this.checkPlane('5');
    } else if (event.planeNumber == '3b' || event.planeNumber == '3c') {
      this.saveAddlTraversePlane(event);
    }

    this.calculate();
  }

  savePlaneData(planeData: PlaneData) {
    this.inputs.PlaneData = planeData;
    this.calculate();
  }

  saveAddlTraversePlane(event: { planeNumber: string, plane: Plane }) {
    if (event.planeNumber == '3b') {
      this.inputs.PlaneData.AddlTraversePlanes[0] = event.plane;
    } else if (event.planeNumber == '3c') {
      this.inputs.PlaneData.AddlTraversePlanes[1] = event.plane;
    }
    this.checkTraversePlanes();
  }

  checkTraversePlanes() {
    if (this.inputs.PlaneData.AddlTraversePlanes.length > 0) {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.AddlTraversePlanes[0], this.settings, '3b');
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.inputs.PlaneData.AddlTraversePlanes[0]);
      //todo: logic for checking readings valid
      if (tmpForm1.status == 'VALID' && tmpForm2.status == 'VALID') {
        this.plane3bDone = true;
      } else {
        this.plane3bDone = false;
      }
    } else {
      this.plane3bDone = true;
    }
    if (this.inputs.PlaneData.AddlTraversePlanes.length > 1) {
      let tmpForm1: FormGroup = this.fsat203Service.getPlaneFormFromObj(this.inputs.PlaneData.AddlTraversePlanes[1], this.settings, '3c');
      let tmpForm2: FormGroup = this.fsat203Service.getTraversePlaneFormFromObj(this.inputs.PlaneData.AddlTraversePlanes[1]);
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

  changeField(str: string) {
    this.currentField = str;
  }

  changePlane(str: string) {
    this.currentPlane = str;
  }

  getMockTraversePlane(): Plane {
    return {
      planeType: 'Rectangular',
      width: undefined,
      length: undefined,
      area: undefined,
      dryBulbTemp: undefined,
      barometricPressure: 29.92,
      numInletBoxes: 0,
      staticPressure: undefined,
      pitotTubeCoefficient: 1,
      pitotTubeType: 'Standard',
      numTraverseHoles: 10,
      numInsertionPoints: 3,
      traverseData: [
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined],
        [undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined, undefined]
      ]
    }
  }
}
