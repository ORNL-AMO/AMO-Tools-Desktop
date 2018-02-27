import { Component, OnInit, Input } from '@angular/core';
import { FanRatedInfo, Fan203Inputs, PlaneData, Plane } from '../../../../shared/models/fan-copy';

import * as _ from 'lodash';
@Component({
  selector: 'app-fan-data',
  templateUrl: './fan-data.component.html',
  styleUrls: ['./fan-data.component.css']
})
export class FanDataComponent implements OnInit {
  @Input()
  planeData: PlaneData;

  stepTab: string = '1';
  showReadings: boolean = false;
  constructor() { }

  ngOnInit() { 
    console.log(this.planeData);
  }

  changeStepTab(str: string) {
    this.stepTab = str;
  }

  showReadingsForm() {
    // if (num == 1) {
    //   this.pitotTubeData[0] = data;
    // } else {
    //   this.pitotTubeData[1] = data;
    // }
    this.showReadings = true;
  }

  savePitotData(){
    // if (num == 1) {
    //   this.pitotTubeData[0] = data;
    // } else {
    //   this.pitotTubeData[1] = data;
    // }
  }
}
