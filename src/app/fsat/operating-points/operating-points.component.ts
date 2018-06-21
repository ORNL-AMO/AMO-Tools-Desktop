import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';


@Component({
  selector: 'app-operating-points',
  templateUrl: './operating-points.component.html',
  styleUrls: ['./operating-points.component.css']
})
export class OperatingPointsComponent implements OnInit {
  @Input()
  settings: Settings;
  @Output('show203')
  show203 = new EventEmitter();

  operatingPoints: Array<OperatingDataPoint>;
  showInputs: boolean = false;
  constructor() { }

  ngOnInit() {
    if (!this.settings.fanCurveType) {
      this.settings.fanCurveType = 'Fan Total Pressure';
    }
    this.operatingPoints = new Array<OperatingDataPoint>();
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

  collapsePoint(point: OperatingDataPoint) {
    point.collapse = !point.collapse;
  }

  removePoint(index: number) {

  }

  addDataRow() {
    this.operatingPoints.push({
      pointDescription: 'Point ' + (this.operatingPoints.length + 1),
      usePtFactor: 'Yes',
      fullSpeed: 'Yes',
      gasFlowRate: 0,
      pressure: 0,
      barometricPressure: 0,
      density: 0,
      fanPower: 0,
      fanSpeed: 0,
      staticHead: 0,
      pt1: 0,
      collapse: false
    })
  }

  show203Module() {
    this.show203.emit(true);
  }
}

export interface OperatingDataPoint {
  pointDescription: string,
  usePtFactor: string,
  pt1: number,
  fullSpeed: string,
  gasFlowRate: number,
  pressure: number,
  barometricPressure: number,
  density: number,
  fanPower: number,
  fanSpeed: number,
  staticHead: number,
  collapse: boolean
}
