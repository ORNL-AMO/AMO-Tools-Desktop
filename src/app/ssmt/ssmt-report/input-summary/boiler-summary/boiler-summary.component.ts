import { Component, OnInit, ChangeDetectorRef, Input } from '@angular/core';
import { SSMTInputs, SsmtValid } from '../../../../shared/models/steam/ssmt';
import { Settings } from '../../../../shared/models/settings';
import * as _ from 'lodash';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
import { SqlDbApiService } from '../../../../tools-suite-api/sql-db-api.service';

@Component({
    selector: 'app-boiler-summary',
    templateUrl: './boiler-summary.component.html',
    styleUrls: ['./boiler-summary.component.css'],
    standalone: false
})
export class BoilerSummaryComponent implements OnInit {
  @Input()
  baselineInputData: SSMTInputs;
  @Input()
  modificationInputData: Array<{ name: string, inputData: SSMTInputs, valid: SsmtValid }>;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean

  collapse: boolean = true;
  numMods: number = 0;

  fuelTypeDiff: Array<boolean>;
  fuelDiff: Array<boolean>;
  combustionEfficiencyDiff: Array<boolean>;
  blowdownRateDiff: Array<boolean>;
  blowdownFlashedDiff: Array<boolean>;
  preheatMakeupWaterDiff: Array<boolean>;
  steamTemperatureDiff: Array<boolean>;
  deaeratorVentRateDiff: Array<boolean>;
  deaeratorPressureDiff: Array<boolean>;
  approachTemperatureDiff: Array<boolean>;

  solidLiquidFuelTypes: Array<SolidLiquidFlueGasMaterial>;
  gasFuelTypes: Array<FlueGasMaterial>;
  constructor(private cd: ChangeDetectorRef, private sqlDbApiService: SqlDbApiService) { }

  ngOnInit() {
    this.solidLiquidFuelTypes = this.sqlDbApiService.selectSolidLiquidFlueGasMaterials();
    this.gasFuelTypes = this.sqlDbApiService.selectGasFlueGasMaterials();


    this.fuelTypeDiff = new Array<boolean>();
    this.fuelDiff = new Array<boolean>();
    this.combustionEfficiencyDiff = new Array<boolean>();
    this.blowdownRateDiff = new Array<boolean>();
    this.blowdownFlashedDiff = new Array<boolean>();
    this.preheatMakeupWaterDiff = new Array<boolean>();
    this.steamTemperatureDiff = new Array<boolean>();
    this.deaeratorVentRateDiff = new Array<boolean>();
    this.deaeratorPressureDiff = new Array<boolean>();
    this.approachTemperatureDiff = new Array<boolean>();
    if (this.modificationInputData) {
      this.numMods = this.modificationInputData.length;
      this.modificationInputData.forEach(mod => {
        this.fuelTypeDiff.push(false);
        this.fuelDiff.push(false);
        this.combustionEfficiencyDiff.push(false);
        this.blowdownRateDiff.push(false);
        this.blowdownFlashedDiff.push(false);

        this.preheatMakeupWaterDiff.push(false);
        this.steamTemperatureDiff.push(false);
        this.deaeratorVentRateDiff.push(false);
        this.deaeratorPressureDiff.push(false);
        this.approachTemperatureDiff.push(false);
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

  toggleCollapse() {
    this.collapse = !this.collapse;
  }

  getFuelType(fuelType: number, fuel: number): any {
    if (fuelType === 0) {
      return _.find(this.solidLiquidFuelTypes, (liquidFuel) => {return liquidFuel.id === fuel; }).substance;
    } else if (fuelType === 1) {
      return _.find(this.gasFuelTypes, (gasFuel) => {return gasFuel.id === fuel; }).substance;
    }
  }

}
