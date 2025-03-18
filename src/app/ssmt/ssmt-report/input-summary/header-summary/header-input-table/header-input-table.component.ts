import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { SSMTInputs, HeaderWithHighestPressure, HeaderNotHighestPressure, SsmtValid } from '../../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../../shared/models/settings';
import { SSMTOutput } from '../../../../../shared/models/steam/steam-outputs';

@Component({
    selector: 'app-header-input-table',
    templateUrl: './header-input-table.component.html',
    styleUrls: ['./header-input-table.component.css'],
    standalone: false
})
export class HeaderInputTableComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs }>;
  @Input()
  headerLevel: string;
  @Input()
  numMods: number;
  @Input()
  settings: Settings;
  @Input()
  modificationOutputs: Array<{ name: string, outputData: SSMTOutput, valid: SsmtValid }>;

  pressureDiff: Array<boolean>;
  processSteamUsageDiff: Array<boolean>;
  condensationRecoveryRateDiff: Array<boolean>;
  heatLossTempDiff: Array<boolean>;
  
  flashCondensateDiff: Array<boolean>;
  condensateReturnTempDiff: Array<boolean>;
  desuperheatSteamDiff: Array<boolean>;
  desuperheatSteamTempDiff: Array<boolean>;

  baseline: HeaderWithHighestPressure | HeaderNotHighestPressure;
  modifications: Array<HeaderWithHighestPressure | HeaderNotHighestPressure>;
  tableLabel: string;
  constructor(private cd: ChangeDetectorRef) {
    
   }

  ngOnInit() {
    if (this.headerLevel === 'high') {
      this.baseline = this.baselineInputData.headerInput.highPressureHeader;
      this.tableLabel = 'High Pressure Header';
    }else if (this.headerLevel === 'medium') {
      this.baseline = this.baselineInputData.headerInput.mediumPressureHeader;
      this.tableLabel = 'Medium Pressure Header';
    }else if (this.headerLevel === 'low') {
      this.baseline = this.baselineInputData.headerInput.lowPressureHeader;
      this.tableLabel = 'Low Pressure Header';
    }

    this.modifications = new Array<HeaderWithHighestPressure | HeaderNotHighestPressure>();
    
    this.pressureDiff = new Array<boolean>();
    this.processSteamUsageDiff = new Array<boolean>();
    this.condensationRecoveryRateDiff = new Array<boolean>();
    this.flashCondensateDiff = new Array<boolean>();
    this.heatLossTempDiff = new Array<boolean>();
    this.condensateReturnTempDiff = new Array<boolean>();
    this.desuperheatSteamDiff = new Array<boolean>();
    this.desuperheatSteamTempDiff = new Array<boolean>();
    if (this.modificationInputData) {
      this.numMods = this.modificationInputData.length;
      this.modificationInputData.forEach(mod => {
        if (this.headerLevel === 'high') {
          this.modifications.push(mod.inputData.headerInput.highPressureHeader);
        }else if (this.headerLevel === 'medium') { 
          this.modifications.push(mod.inputData.headerInput.mediumPressureHeader);     
        }else if (this.headerLevel === 'low') {                   
          this.modifications.push(mod.inputData.headerInput.lowPressureHeader);
        }

        this.pressureDiff.push(false);
        this.processSteamUsageDiff.push(false);
        this.condensationRecoveryRateDiff.push(false);
        this.flashCondensateDiff.push(false);
        this.heatLossTempDiff.push(false);
        this.condensateReturnTempDiff.push(false);
        this.desuperheatSteamDiff.push(false);
        this.desuperheatSteamTempDiff.push(false);
      });
    }
  }

  //function used to check if baseline and modification values are different
  //called from html
  //diffBool is name of corresponding input boolean to indicate different
  checkDiff(baselineVal: any, modificationVal: any, diffBool: string, modIndex: number) {
    if (baselineVal !== modificationVal) {
      //this[diffBool] gets corresponding variable
      //only set true once
      if (this[diffBool][modIndex] !== true) {
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
