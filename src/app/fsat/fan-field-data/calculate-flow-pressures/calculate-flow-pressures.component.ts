import { Component, OnInit, Input } from '@angular/core';
import { FSAT, Fan203Inputs, PlaneResults } from '../../../shared/models/fans';
import { Settings } from '../../../shared/models/settings';
import { Fsat203Service } from '../../../calculator/fans/fsat-203/fsat-203.service';
import { FsatService } from '../../fsat.service';

@Component({
  selector: 'app-calculate-flow-pressures',
  templateUrl: './calculate-flow-pressures.component.html',
  styleUrls: ['./calculate-flow-pressures.component.css']
})
export class CalculateFlowPressuresComponent implements OnInit {
  @Input()
  fsat: FSAT;
  @Input()
  settings: Settings;

  planeResults: PlaneResults;
  mockInputs: Fan203Inputs;
  constructor(private fsat203Service: Fsat203Service, private fsatService: FsatService) { }

  ngOnInit() {
    let mockData: Fan203Inputs = this.fsat203Service.getMockData();
    if (!this.fsat.planeData) {
      this.fsat.planeData = mockData.PlaneData;
    }
    if (!this.fsat.fanRatedInfo) {
      this.fsat.fanRatedInfo = mockData.FanRatedInfo;
    }
    this.calculate(this.fsat);
  }


  calculate(fsat: FSAT) {
    this.fsat.fanRatedInfo = fsat.fanRatedInfo;
    this.fsat.planeData = fsat.planeData;
    console.log(this.fsat.planeData.outletSEF);
    this.mockInputs = {
      FanRatedInfo: this.fsat.fanRatedInfo,
      PlaneData: this.fsat.planeData,
      FanShaftPower: undefined,
      BaseGasDensity: this.fsat.baseGasDensity
    }
    this.planeResults = this.fsatService.getPlaneResults(this.mockInputs);
  }
}
