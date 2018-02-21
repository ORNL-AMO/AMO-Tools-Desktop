import { Component, OnInit, Input } from '@angular/core';
import { HelpPanelService } from '../help-panel/help-panel.service';
import { Settings } from '../../shared/models/settings';
@Component({
  selector: 'app-fan-curve-data',
  templateUrl: './fan-curve-data.component.html',
  styleUrls: ['./fan-curve-data.component.css']
})
export class FanCurveDataComponent implements OnInit {
  @Input()
  settings: Settings;

  showInputs: boolean = false;

  curveDataArr: Array<FanCurveDataPoint>;

  constructor() { }

  ngOnInit() {
    if (!this.settings.fanCurveType) {
      this.settings.fanCurveType = 'Fan Total Pressure';
    }
    this.curveDataArr = new Array<FanCurveDataPoint>();
    for (let i = 1; i < 11; i++) {
      this.addDataRow();
    }
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

  addDataRow() {
    this.curveDataArr.push({
      gasFlowRate: 0,
      pressure: 0,
      fanPower: 0
    })
  }

}


export interface FanCurveDataPoint {
  gasFlowRate: number,
  pressure: number,
  fanPower: number
}