import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyFuel } from '../../../shared/models/phast/meteredEnergy';
import { SuiteDbService } from '../../../suiteDb/suite-db.service';
import { FlueGasMaterial } from '../../../shared/models/materials';
import { Settings } from '../../../shared/models/settings';
import { ConvertPhastService } from '../../convert-phast.service';
import { PhastService } from "../../phast.service";

@Component({
  selector: 'app-metered-fuel-form',
  templateUrl: './metered-fuel-form.component.html',
  styleUrls: ['./metered-fuel-form.component.css']
})
export class MeteredFuelFormComponent implements OnInit {
  @Input()
  inputs: MeteredEnergyFuel;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  inCalc: boolean;
  @Input()
  inElectricity: boolean;

  fuelTypes: FlueGasMaterial[];
  setMeteredEnergy: boolean;

  constructor(private suiteDbService: SuiteDbService, private convertPhastService: ConvertPhastService, private phastService: PhastService) { }

  ngOnInit() {
    this.getFuelTypes(true);
    this.calculate();
  }

  getFuelTypes(bool?: boolean) {
    if (this.inputs.fuelDescription === 'gas') {
      this.fuelTypes = this.suiteDbService.selectGasFlueGasMaterials();
    } else if (this.inputs.fuelDescription === 'solidLiquid') {
      this.fuelTypes = this.suiteDbService.selectSolidLiquidFlueGasMaterials();
    }
    if (!bool) {
      this.inputs.fuelType = undefined;
      this.inputs.heatingValue = 0;
    }
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }

  showHideInputField() {
    this.inputs.userDefinedMeteredEnergy = !this.inputs.userDefinedMeteredEnergy;
    if(!this.inputs.userDefinedMeteredEnergy){
      this.calculate();
    }
  }

  setProperties() {
    if (this.inputs.fuelDescription === 'gas') {
      let fuel = this.suiteDbService.selectGasFlueGasMaterialById(this.inputs.fuelType);
      if (this.settings.unitsOfMeasure === 'Metric') {
        fuel.heatingValueVolume = this.convertPhastService.convertVal(fuel.heatingValueVolume, 'btuSCF', 'kJNm3');
      }
      this.inputs.heatingValue = fuel.heatingValueVolume;
    } else {
      const fuel = this.suiteDbService.selectSolidLiquidFlueGasMaterialById(this.inputs.fuelType);
      let heatingVal = this.phastService.flueGasByMassCalculateHeatingValue(fuel);
      if (this.settings.unitsOfMeasure === 'Metric') {
        heatingVal = this.convertPhastService.convertVal(heatingVal, 'btuLb', 'kJkg');
      }
      this.inputs.heatingValue = heatingVal;
    }
    this.calculate();
  }

  setFlowRate() {
    this.inputs.fuelEnergy = this.inputs.fuelFlowRateInput * this.inputs.heatingValue * this.inputs.collectionTime / 1000000;
  }

  calculate() {
    if (!this.inputs.userDefinedMeteredEnergy) {
      this.setFlowRate();
    }
    this.emitSave.emit(true);
    this.emitCalculate.emit(true);
  }
}
