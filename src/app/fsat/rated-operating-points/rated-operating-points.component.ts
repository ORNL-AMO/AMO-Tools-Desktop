import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';


@Component({
  selector: 'app-rated-operating-points',
  templateUrl: './rated-operating-points.component.html',
  styleUrls: ['./rated-operating-points.component.css']
})
export class RatedOperatingPointsComponent implements OnInit {
  @Input()
  settings: Settings;

  operatingPoints: Array<RatedOperatingDataPoint>;
  showInputs: boolean = false;
  constructor() { }

  ngOnInit() {
    if (!this.settings.fanCurveType) {
      this.settings.fanCurveType = 'Fan Total Pressure';
    }
    this.operatingPoints = new Array<RatedOperatingDataPoint>();
    this.addDataRow();
  }


  showForm() {
    this.showInputs = true;
  }

  save() {
    //todo
  }

  focusField(str: string) {
    //todo
  }

  removeRow(index: number) {
    //todo
  }

  collapsePoint(point: RatedOperatingDataPoint) {
    point.collapse = !point.collapse;
  }

  removePoint(index: number) {

  }

  addDataRow() {
    this.operatingPoints.push({
      pointDescription: 'Point ' + (this.operatingPoints.length+1),
      correspondingTo: '',
      fullSpeed: 'Yes',
      gasFlowRate: 0,
      pressure: 0,
      density: 0,
      fanPower: 0,
      fanSpeed: 0,
      staticHead: 0,
      collapse: false
    })
  }
}

export interface RatedOperatingDataPoint {
  pointDescription: string,
  correspondingTo: string,
  fullSpeed: string,
  gasFlowRate: number,
  pressure: number,
  density: number,
  fanPower: number,
  fanSpeed: number,
  staticHead: number,
  collapse: boolean
}
