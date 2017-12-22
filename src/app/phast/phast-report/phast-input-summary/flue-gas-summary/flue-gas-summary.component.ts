import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGas } from '../../../../shared/models/phast/losses/flueGas';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-flue-gas-summary',
  templateUrl: './flue-gas-summary.component.html',
  styleUrls: ['./flue-gas-summary.component.css']
})
export class FlueGasSummaryComponent implements OnInit {
  @Input()
  phast: PHAST
  @Input()
  settings: Settings;

  lossData: Array<any>;
  volumeOptions: Array<any>;
  massOptions: Array<any>;
  numLosses: number = 0;
  collapse: boolean = true;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.volumeOptions = this.suiteDbService.selectGasFlueGasMaterials();
    this.massOptions = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    this.lossData = new Array();
    if (this.phast.losses) {
      if (this.phast.losses.flueGasLosses) {
        this.numLosses = this.phast.losses.flueGasLosses.length;
        let index: number = 0;
        this.phast.losses.flueGasLosses.forEach(loss => {
          let modificationData = new Array();
          if (this.phast.modifications) {
            this.phast.modifications.forEach(mod => {
              let modData = this.getData(mod.phast.losses.flueGasLosses[index]);
              modificationData.push(modData);
            })
          }
          this.lossData.push({
            baseline: this.getData(loss),
            modifications: modificationData
          });
          index++;
        })
      }
    }
  }

  toggleCollapse() {
    this.collapse = !this.collapse;
  }


  getData(loss: FlueGas): FlueGasSummaryData {
    let tmpName, tmpGasTemp, tmpMethod, tmpOxygen, tmpExcessAir, tmpCombustionTemp, tmpFuelTemp,
      tmpMoisture, tmpDischargeTemp, tmpUnburnedCarbon;

    if (loss.flueGasType == 'By Volume') {
      let tmpGas = this.volumeOptions.find(val => {return loss.flueGasByVolume.gasTypeId == val.id})
      tmpName = tmpGas.substance;
      tmpGasTemp = loss.flueGasByVolume.flueGasTemperature;
      tmpMethod = loss.flueGasByVolume.oxygenCalculationMethod;
      tmpOxygen = loss.flueGasByVolume.o2InFlueGas;
      tmpExcessAir = loss.flueGasByVolume.excessAirPercentage;
      tmpCombustionTemp = loss.flueGasByVolume.combustionAirTemperature;
      tmpFuelTemp = loss.flueGasByVolume.fuelTemperature;
    } else if (loss.flueGasType == 'By Mass') {
      let tmpGas = this.massOptions.find(val => {return loss.flueGasByMass.gasTypeId == val.id})
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
      unburnedCarbon: tmpUnburnedCarbon
    }
    return tmpSummaryData;
  }

}


export interface FlueGasSummaryData {
  name: string,
  type: string,
  fuelName: string,
  flueGasTemp: number,
  excessAirMethod: string,
  oxygenInFlueGas: number,
  excessAir: number,
  combustionAirTemp: number,
  fuelTemperature: number,
  moistureInAir: number,
  dischargeTemp: number,
  unburnedCarbon: number
}
