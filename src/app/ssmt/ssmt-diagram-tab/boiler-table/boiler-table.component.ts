import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BoilerOutput } from '../../../shared/models/steam/steam-outputs';
import { SSMTInputs } from '../../../shared/models/steam/ssmt';
import { Settings } from '../../../shared/models/settings';
import { BoilerService } from '../../../calculator/steam/boiler/boiler.service';
import { BoilerInput } from '../../../shared/models/steam/steam-inputs';
import { SsmtService } from '../../ssmt.service';

@Component({
  selector: 'app-boiler-table',
  templateUrl: './boiler-table.component.html',
  styleUrls: ['./boiler-table.component.css']
})
export class BoilerTableComponent implements OnInit {
  @Input()
  boiler: BoilerOutput;
  @Input()
  inputData: SSMTInputs;
  @Input()
  settings: Settings;
  @Output('emitShowCalc')
  emitShowCalc = new EventEmitter<boolean>();

  constructor(private boilerCalculatorService: BoilerService, private ssmtService:SsmtService) { }

  ngOnInit() {
  }

  goToCalculator(){
    let boilerInput: BoilerInput = {
      steamPressure: this.inputData.headerInput.highPressure.pressure,
      blowdownRate: this.inputData.boilerInput.blowdownRate,
      steamMassFlow: Number(Math.round(this.boiler.steamMassFlow).toFixed(2)),
      thermodynamicQuantity: 0, //temperature
      quantityValue: this.inputData.boilerInput.steamTemperature,
      combustionEfficiency: this.inputData.boilerInput.combustionEfficiency,
      deaeratorPressure: this.inputData.boilerInput.deaeratorPressure
    }
    this.boilerCalculatorService.boilerInput = boilerInput;
    this.ssmtService.calcTab.next('boiler');
    this.emitShowCalc.emit(true);
  }
}
