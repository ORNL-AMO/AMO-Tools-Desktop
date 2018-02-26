import { Component, OnInit } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, BaseGasDensity } from '../../../shared/models/fans';
import { FsatService } from '../../../fsat/fsat.service';

@Component({
  selector: 'app-fsat-203',
  templateUrl: './fsat-203.component.html',
  styleUrls: ['./fsat-203.component.css']
})
export class Fsat203Component implements OnInit {
  tabSelect: string = 'results';
  inputs: Fan203Inputs = {
    FanRatedInfo: {
      fanSpeed: 1191.0,
      motorSpeed: 1191.0,
      fanSpeedCorrected: 1170.0,
      densityCorrected: .0500,
      pressureBarometricCorrected: 26.28,
      driveType: 'Direct Drive',
      includesEvase: 'Yes',
      upDownStream: 'Upstream',
      traversePlanes: 1,
      planarBarometricPressure: 10
    },

    BaseGasDensity: {
      method: 'Relative Humidity %',
      gasType: 'Air',
      //  humidityData: 'Wet Bulb Temperature',
      conditionLocation: 4,
      dryBulbTemp: 123,
      staticPressure: -17.6,
      barometricPressure: 26.57,
      gasSpecificGravity: 1.00,
      wetBulbTemp: 119.0,
      relativeHumidity: 0,
      gasDewpointTemp: 0,
      gasDensity: 0.0547
    },
    FanShaftPower: {
      isMethodOne: true,
      voltage: 0,
      amps: 0,
      powerFactorAtLoad: 0,
      efficiencyMotor: 0,
      efficiencyVFD: 0,
      efficiencyBelt: 0,
      sumSEF: 0
    }
  }
  showBasics: boolean = true;
  basicsDone: boolean = false;
  densityDone: boolean = false;
  canContinue: boolean = false;
  formSelect: string = 'none';
  constructor(private fsatService: FsatService) { }

  ngOnInit() {
    this.fsatService.test();
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  continue() {
    this.showBasics = false;
  }

  editBasics() {
    this.showBasics = true;
  }

  saveBasics(info: FanRatedInfo) {
    this.inputs.FanRatedInfo = info;
  }

  saveDensity(density: BaseGasDensity) {
    this.inputs.BaseGasDensity = density;
  }

  setDensityContinue(bool: boolean) {
    this.densityDone = bool;
  }

  setBasicsContinue(bool: boolean) {
    this.basicsDone = bool;
  }

  checkContinue() {
    this.canContinue = (this.basicsDone && this.densityDone);
  }

  goToForm(str: string){
    this.formSelect = str;
  }
}
