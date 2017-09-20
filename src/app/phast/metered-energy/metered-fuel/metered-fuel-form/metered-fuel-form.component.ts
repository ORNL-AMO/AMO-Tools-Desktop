import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { MeteredEnergyFuel } from '../../../../shared/models/phast/meteredEnergy';
import { SuiteDbService } from '../../../../suiteDb/suite-db.service';
import { FlueGasMaterial } from '../../../../shared/models/materials';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-metered-fuel-form',
  templateUrl: './metered-fuel-form.component.html',
  styleUrls: ['./metered-fuel-form.component.css', '../../../../psat/explore-opportunities/explore-opportunities-form/explore-opportunities-form.component.css']
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
  fuelTypes: FlueGasMaterial[];
  fuelFlowInput: boolean;
  counter: any;
  constructor(private suiteDbService: SuiteDbService) { }

  ngOnInit() {
    this.fuelTypes = this.suiteDbService.selectGasFlueGasMaterials();
  }

  focusField(str: string) {
    this.changeField.emit(str);
  }
  showHideInputField() {
    this.fuelFlowInput = !this.fuelFlowInput;
  }
  setProperties() {
    let fuel = this.suiteDbService.selectGasFlueGasMaterialById(this.inputs.fuelType);
    this.inputs.heatingValue = fuel.heatingValue;
    this.calculate();
  }
  setFlowRate() {
    //added if so that HHV input also calls setFlowRate() before calculate()
    if (this.fuelFlowInput) {
      this.inputs.fuelEnergy = this.inputs.fuelFlowRateInput * this.inputs.heatingValue;
    }
    this.calculate();
  }
  calculate() {
    this.startSavePolling();
    this.emitCalculate.emit(true);
  }

  startSavePolling() {
    if (this.counter) {
      clearTimeout(this.counter);
    }
    this.counter = setTimeout(() => {
      this.emitSave.emit(true);
    }, 3000)
  }

}
