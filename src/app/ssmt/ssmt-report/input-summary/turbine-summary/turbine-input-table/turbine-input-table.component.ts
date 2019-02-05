import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PressureTurbine, CondensingTurbine } from '../../../../../shared/models/steam/ssmt';

@Component({
  selector: 'app-turbine-input-table',
  templateUrl: './turbine-input-table.component.html',
  styleUrls: ['./turbine-input-table.component.css']
})
export class TurbineInputTableComponent implements OnInit {
  @Input()
  baselineTurbine: CondensingTurbine | PressureTurbine;
  @Input()
  modificationTurbines: Array<{ turbine: CondensingTurbine | PressureTurbine, name: string }>;
  @Input()
  turbineType: string;
  @Input()
  numMods: number;

  isentropicEfficiencyDiff: Array<boolean>;
  generationEfficiencyDiff: Array<boolean>;
  condenserPressureDiff: Array<boolean>;
  operationTypeDiff: Array<boolean>;
  
  operationValue1Diff: Array<boolean>;
  operationValue2Diff: Array<boolean>;


  tableLabel: string;
  constructor(private cd: ChangeDetectorRef) { }

  ngOnInit() {
    
    if(this.turbineType == 'condensing'){
      this.tableLabel = 'Condensing Turbine';
    }else if(this.turbineType == 'highToLow'){
      this.tableLabel = 'High To Low Pressure Turbine';
    }else if(this.turbineType == 'highToMedium'){
      this.tableLabel = 'Medium To Medium Pressure Turbine';
    }else if(this.turbineType == 'mediumToLow'){
      this.tableLabel = 'Medium To Low Pressure Turbine';
    }

    this.isentropicEfficiencyDiff = new Array<boolean>();
    this.generationEfficiencyDiff = new Array<boolean>();
    this.condenserPressureDiff = new Array<boolean>();
    this.operationValue1Diff = new Array<boolean>();
    this.operationTypeDiff = new Array<boolean>();
    this.operationValue2Diff = new Array<boolean>();
    if (this.modificationTurbines) {
      this.numMods = this.modificationTurbines.length;
      this.modificationTurbines.forEach(mod => {
        this.isentropicEfficiencyDiff.push(false);
        this.generationEfficiencyDiff.push(false);
        this.condenserPressureDiff.push(false);
        this.operationValue1Diff.push(false);
        this.operationTypeDiff.push(false);
        this.operationValue2Diff.push(false);
      })
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, modIndex: number) {
    if (baselineVal != modificationVal) {
      //this[diffBool] get's corresponding variable
      //only set true once
      if (this[diffBool][modIndex] != true) {
        //set true/different
        this[diffBool][modIndex] = true;
        //tell html to detect change
        this.cd.detectChanges();
      }
      return true;
    } else {
      return false;
    }
  }

}
