import { Component, OnInit, Input, ChangeDetectorRef } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasMaterial, SolidLiquidFlueGasMaterial } from '../../../../shared/models/materials';
@Component({
  selector: 'app-flue-gas-summary',
  templateUrl: './flue-gas-summary.component.html',
  styleUrls: ['./flue-gas-summary.component.css']
})
export class FlueGasSummaryComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  
  lossData: Array<any>;
  volumeOptions: Array<FlueGasMaterial>;
  massOptions: Array<SolidLiquidFlueGasMaterial>;
  numLosses: number = 0;
  collapse: boolean = true;

  typeDiff: Array<boolean>;
  fuelNameDiff: Array<boolean>;
  flueGasTempDiff: Array<boolean>;
  excessAirMethodDiff: Array<boolean>;
  oxygenInFlueGasDiff: Array<boolean>;
  excessAirDiff: Array<boolean>;
  combustionAirTempDiff: Array<boolean>;
  fuelTemperatureDiff: Array<boolean>;
  moistureInAirDiff: Array<boolean>;
  dischargeTempDiff: Array<boolean>;
  unburnedCarbonDiff: Array<boolean>;

  c2h6Diff: Array<boolean>;
  c3h8Diff: Array<boolean>;
  c4h10cnh2nDiff: Array<boolean>;
  ch4Diff: Array<boolean>;
  coDiff: Array<boolean>;
  co2Diff: Array<boolean>;
  h2Diff: Array<boolean>;
  h2oDiff: Array<boolean>;
  n2Diff: Array<boolean>;
  o2Diff: Array<boolean>;
  so2Diff: Array<boolean>;

  numMods: number = 0;
  constructor(private suiteDbService: SuiteDbService, private cd: ChangeDetectorRef) { }

  ngOnInit() {
    this.typeDiff = new Array();
    this.fuelNameDiff = new Array();
    this.flueGasTempDiff = new Array();
    this.excessAirMethodDiff = new Array();
    this.oxygenInFlueGasDiff = new Array();
    this.excessAirDiff = new Array();
    this.combustionAirTempDiff = new Array();
    this.fuelTemperatureDiff = new Array();
    this.moistureInAirDiff = new Array();
    this.dischargeTempDiff = new Array();
    this.unburnedCarbonDiff = new Array();
    this.c2h6Diff = new Array();
    this.c3h8Diff = new Array();
    this.c4h10cnh2nDiff = new Array();
    this.ch4Diff = new Array();
    this.coDiff = new Array();
    this.co2Diff = new Array();
    this.h2Diff = new Array();
    this.h2oDiff = new Array();
    this.n2Diff = new Array();
    this.o2Diff = new Array();
    this.so2Diff = new Array();
  
    this.volumeOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.massOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.modifications) {
        this.numMods = this.phast.modifications.length;
      }
      if (this.phast.losses.flueGasLosses) {
        this.numLosses = this.phast.losses.flueGasLosses.length;
        let index: number = 0;
        this.phast.losses.flueGasLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = this.getData(mod.phast.losses.flueGasLosses[index]);
              modificationData.push(modData);
            });
          }
          this.lossData.push({
            baseline: this.getData(loss),
            modifications: modificationData
          });
          //initialize array values for every defined loss
          this.typeDiff.push(false);
          this.fuelNameDiff.push(false);
          this.flueGasTempDiff.push(false);
          this.excessAirMethodDiff.push(false);
          this.oxygenInFlueGasDiff.push(false);
          this.excessAirDiff.push(false);
          this.combustionAirTempDiff.push(false);
          this.fuelTemperatureDiff.push(false);
          this.moistureInAirDiff.push(false);
          this.dischargeTempDiff.push(false);
          this.unburnedCarbonDiff.push(false);
          this.c2h6Diff.push(false);
          this.c3h8Diff.push(false);
          this.c4h10cnh2nDiff.push(false);
          this.ch4Diff.push(false);
          this.coDiff.push(false);
          this.co2Diff.push(false);
          this.h2Diff.push(false);
          this.h2oDiff.push(false);
          this.n2Diff.push(false);
          this.o2Diff.push(false);
          this.so2Diff.push(false);
          //index +1 for next loss
          index++;
        });
      }
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


  getData(loss: FlueGas): FlueGasSummaryData {
    let tmpName, tmpGasTemp, tmpMethod, tmpOxygen, tmpExcessAir, tmpCombustionTemp, tmpFuelTemp,
      tmpMoisture, tmpDischargeTemp, tmpUnburnedCarbon;
    let tmpGas: FlueGasMaterial | SolidLiquidFlueGasMaterial;

    if (loss.flueGasType === 'By Volume') {
      tmpGas = this.volumeOptions.find(val => { return loss.flueGasByVolume.gasTypeId === val.id; });
      tmpName = tmpGas.substance;
      tmpGasTemp = loss.flueGasByVolume.flueGasTemperature;
      tmpMethod = loss.flueGasByVolume.oxygenCalculationMethod;
      tmpOxygen = loss.flueGasByVolume.o2InFlueGas;
      tmpExcessAir = loss.flueGasByVolume.excessAirPercentage;
      tmpCombustionTemp = loss.flueGasByVolume.combustionAirTemperature;
      tmpFuelTemp = loss.flueGasByVolume.fuelTemperature;
    } else if (loss.flueGasType === 'By Mass') {
      tmpGas = this.massOptions.find(val => { return loss.flueGasByMass.gasTypeId === val.id; });
      tmpName = tmpGas.substance;
      tmpGasTemp = loss.flueGasByMass.flueGasTemperature;
      tmpMethod = loss.flueGasByMass.oxygenCalculationMethod;
      tmpOxygen = loss.flueGasByMass.o2InFlueGas;
      tmpExcessAir = loss.flueGasByMass.excessAirPercentage;
      tmpCombustionTemp = loss.flueGasByMass.combustionAirTemperature;
      tmpFuelTemp = loss.flueGasByMass.fuelTemperature;
      tmpMoisture = loss.flueGasByMass.moisture;
      tmpDischargeTemp = loss.flueGasByMass.ashDischargeTemperature;
      tmpUnburnedCarbon = loss.flueGasByMass.unburnedCarbonInAsh;
    }
    let tmpSummaryData: FlueGasSummaryData = {
      name: loss.name,
      type: loss.flueGasType,
      fuelName: tmpName,
      flueGasTemp: tmpGasTemp,
      excessAirMethod: tmpMethod,
      oxygenInFlueGas: tmpOxygen,
      excessAir: tmpExcessAir,
      combustionAirTemp: tmpCombustionTemp,
      fuelTemperature: tmpFuelTemp,
      moistureInAir: tmpMoisture,
      dischargeTemp: tmpDischargeTemp,
      unburnedCarbon: tmpUnburnedCarbon,
      material: tmpGas
    };
    return tmpSummaryData;
  }
}


export interface FlueGasSummaryData {
  name: string;
  type: string;
  fuelName: string;
  flueGasTemp: number;
  excessAirMethod: string;
  oxygenInFlueGas: number;
  excessAir: number;
  combustionAirTemp: number;
  fuelTemperature: number;
  moistureInAir: number;
  dischargeTemp: number;
  unburnedCarbon: number;
  material: FlueGasMaterial | SolidLiquidFlueGasMaterial;
}
