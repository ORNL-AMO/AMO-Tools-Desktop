import { Component, OnInit } from '@angular/core';
import { FanRatedInfo } from '../../../shared/models/fans';
import { FanGasDensity } from './fan-data/gas-density/gas-density.component';

@Component({
  selector: 'app-fsat-203',
  templateUrl: './fsat-203.component.html',
  styleUrls: ['./fsat-203.component.css']
})
export class Fsat203Component implements OnInit {
  tabSelect: string = 'results';

  fanRatedInfo: FanRatedInfo = {
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
  };

  fanGasDensity: FanGasDensity = {
    method: 1,
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
  }

  showBasics: boolean = true;
  constructor() { }

  ngOnInit() {
  }


  setTab(str: string) {
    this.tabSelect = str;
  }

  continue(){
    this.showBasics = false;
  }

  editBasics(){
    this.showBasics = true;
  }

  save(info: FanRatedInfo){
    this.fanRatedInfo = info;
  }
}
