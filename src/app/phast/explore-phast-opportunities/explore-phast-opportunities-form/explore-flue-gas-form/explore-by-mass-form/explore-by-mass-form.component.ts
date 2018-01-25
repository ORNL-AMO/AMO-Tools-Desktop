import { Component, OnInit, EventEmitter, Output, Input } from '@angular/core';
import { PHAST } from '../../../../../shared/models/phast/phast';
import { Settings } from '../../../../../shared/models/settings';
import { FlueGasByMass } from '../../../../../shared/models/phast/losses/flueGas';

@Component({
  selector: 'app-explore-by-mass-form',
  templateUrl: './explore-by-mass-form.component.html',
  styleUrls: ['./explore-by-mass-form.component.css']
})
export class ExploreByMassFormComponent implements OnInit {
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

  baselineFlueGas: FlueGasByMass;
  modifiedFlueGas: FlueGasByMass;
  constructor() { }

  ngOnInit() {
    this.baselineFlueGas = this.phast.losses.flueGasLosses[0].flueGasByMass;
    this.modifiedFlueGas = this.phast.modifications[this.exploreModIndex].phast.losses.flueGasLosses[0].flueGasByMass;
  }

  toggleO2(){
    
  }

  focusOut() {

  }

  calculate(){
    //this.emitCalculate.emit(true)
  }

  focusField(str: string) {
    //this.changeField.emit(str);
  }
}
