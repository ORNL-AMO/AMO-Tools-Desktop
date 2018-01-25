import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
import { FlueGasByMass, FlueGasByVolume } from '../../../../shared/models/phast/losses/flueGas';

@Component({
  selector: 'app-explore-flue-gas-form',
  templateUrl: './explore-flue-gas-form.component.html',
  styleUrls: ['./explore-flue-gas-form.component.css']
})
export class ExploreFlueGasFormComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Output('emitCalculate')
  emitCalculate = new EventEmitter<boolean>();
  @Output('changeField')
  changeField = new EventEmitter<string>();
  @Input()
  settings: Settings;
  @Input()
  exploreModIndex: number;
  baselineFlueGas: FlueGasByMass | FlueGasByVolume;
  modifiedFlueGas: FlueGasByMass | FlueGasByVolume;

  showFlueGas
  showExcessAir
  showO2
  showFuelTemp
  showAirTemp
  constructor() { }

  ngOnInit() {
    if (this.phast.losses.flueGasLosses[0].flueGasType == 'By Mass') {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByMass;
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByMass;
    } else {
      this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByVolume;
      this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByVolume;
    }
  }



  toggleFlueGas() {

  }
  toggleAirTemp() { }
  toggleFuelTemp() { }
  toggleExcessAir() { }
  toggleO2() { }
  focusOut() {

  }

  calculate() {
    //this.emitCalculate.emit(true)
  }

  focusField(str: string) {
    //this.changeField.emit(str);
  }

}
