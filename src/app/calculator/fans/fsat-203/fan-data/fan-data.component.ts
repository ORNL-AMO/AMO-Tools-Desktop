import { Component, OnInit, Input } from '@angular/core';
import { FanRatedInfo } from '../../../../shared/models/fans';
import { FanData } from './fan-data-form/fan-data-form.component';
import * as _ from 'lodash';
import { PitotTubeData } from './plane-3-form/plane-3-form.component';
@Component({
  selector: 'app-fan-data',
  templateUrl: './fan-data.component.html',
  styleUrls: ['./fan-data.component.css']
})
export class FanDataComponent implements OnInit {

  stepTab: string = '1';

  planeData: Array<FanData> = [
    {
      planeNum: '1',
      planeDescription: 'Fan Inlet Flange',
      shape: 'Rectangular',
      length: 143.63,
      width: 32.63,
      area: 0,
      staticPressure: 0,
      dryBulbTemp: 123,
      barometricPressure: 26.57,
      numInletBoxes: 0
    },
    {
      planeNum: '2',
      planeDescription: 'Fan or Evase Outlet Flange',
      shape: 'Rectangular',
      length: 143.63,
      width: 32.63,
      area: 0,
      staticPressure: 0,
      dryBulbTemp: 123,
      barometricPressure: 26.57,
      numInletBoxes: 0
    }, {
      planeNum: '3a',
      planeDescription: 'Additional Traverse Plane 1',
      shape: 'Rectangular',
      length: 143.63,
      width: 32.63,
      area: 0,
      staticPressure: 0,
      dryBulbTemp: 123,
      barometricPressure: 26.57,
      numInletBoxes: 0
    }, {
      planeNum: '3b',
      planeDescription: 'Additional Traverse Plane 2',
      shape: 'Rectangular',
      length: 143.63,
      width: 32.63,
      area: 0,
      staticPressure: 0,
      dryBulbTemp: 123,
      barometricPressure: 26.57,
      numInletBoxes: 0
    }, {
      planeNum: '4',
      planeDescription: 'Outlet Measurement Plane',
      shape: 'Rectangular',
      length: 143.63,
      width: 32.63,
      area: 0,
      staticPressure: 0,
      dryBulbTemp: 123,
      barometricPressure: 26.57,
      numInletBoxes: 0
    },
    {
      planeNum: '5',
      planeDescription: 'Outlet Measurement Plane',
      shape: 'Rectangular',
      length: 143.63,
      width: 32.63,
      area: 0,
      staticPressure: 0,
      dryBulbTemp: 123,
      barometricPressure: 26.57,
      numInletBoxes: 0
    }
  ];

  pitotTubeData: Array<PitotTubeData> = [
    {
      tubeType: 'Standard',
      tubeCoefficient: 0,
      traverseHoles: 0,
      insertionPoints: 0,
      pressureReadings: []
    },
    {
      tubeType: 'Standard',
      tubeCoefficient: 0,
      traverseHoles: 0,
      insertionPoints: 0,
      pressureReadings: []
    }
  ]

  showReadings: boolean = false;
  constructor() { }

  ngOnInit() { }

  changeStepTab(str: string) {
    this.stepTab = str;
  }

  showReadingsForm(){
    this.showReadings = true;
  }
}
