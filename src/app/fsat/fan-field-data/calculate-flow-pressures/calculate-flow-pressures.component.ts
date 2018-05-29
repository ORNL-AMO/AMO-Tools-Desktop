import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
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
  @Output('saveFlowAndPressure')
  saveFlowAndPressure = new EventEmitter<FSAT>();

  planeResults: PlaneResults;
  mockInputs: Fan203Inputs;
  tabSelect: string = 'results';
  constructor(private fsat203Service: Fsat203Service, private fsatService: FsatService) { }

  ngOnInit() {
    let mockData: Fan203Inputs = this.fsat203Service.getMockData();
    if (!this.fsat.fieldData.planeData) {
      this.fsat.fieldData.planeData = mockData.PlaneData;
    }
    if (!this.fsat.fieldData.fanRatedInfo) {
      this.fsat.fieldData.fanRatedInfo = mockData.FanRatedInfo;
    }
    if(!this.fsat.fieldData.pressureCalcResultType){
      this.fsat.fieldData.pressureCalcResultType = 'static';
    }
    //use assessment data
    this.fsat.fieldData.fanRatedInfo.fanSpeed = this.fsat.fanSetup.fanSpeed;
    this.fsat.fieldData.fanRatedInfo.motorSpeed = this.fsat.fanMotor.motorRpm;
    this.fsat.fieldData.fanRatedInfo.globalBarometricPressure = this.fsat.baseGasDensity.barometricPressure;      
    this.calculate(this.fsat);
  }


  calculate(fsat: FSAT) {
    this.fsat.fieldData.fanRatedInfo = fsat.fieldData.fanRatedInfo;
    this.fsat.fieldData.planeData = fsat.fieldData.planeData;
    this.mockInputs = {
      FanRatedInfo: this.fsat.fieldData.fanRatedInfo,
      PlaneData: this.fsat.fieldData.planeData,
      FanShaftPower: undefined,
      BaseGasDensity: this.fsat.baseGasDensity
    }
    this.planeResults = this.fsatService.getPlaneResults(this.mockInputs);
    if(this.fsat.fieldData.pressureCalcResultType == 'static'){
      this.fsat.fieldData.inletPressure = this.roundVal(this.planeResults.FanInletFlange.staticPressure, 5);
      this.fsat.fieldData.outletPressure = this.roundVal(this.planeResults.FanOrEvaseOutletFlange.staticPressure, 5);
    }else if(this.fsat.fieldData.pressureCalcResultType == 'total'){
      this.fsat.fieldData.inletPressure = this.roundVal(this.planeResults.FanInletFlange.gasTotalPressure, 5);
      this.fsat.fieldData.outletPressure = this.roundVal(this.planeResults.FanOrEvaseOutletFlange.gasTotalPressure, 5);
    }
    this.fsat.fieldData.flowRate = this.roundVal(this.planeResults.FanInletFlange.gasVolumeFlowRate, 5);
    this.saveFlowAndPressure.emit(this.fsat);
  }

  roundVal(val, digits): number{
    return Number((Math.round(val * 100) / 100).toFixed(digits))
  }

  setTab(str: string) {
    this.tabSelect = str;
  }

  setPressureCalcType(str:string){
    this.fsat.fieldData.pressureCalcResultType = str;
    this.calculate(this.fsat);
  }
}
