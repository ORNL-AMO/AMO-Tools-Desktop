import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { EnergyEquivalencyElectric, EnergyEquivalencyFuel, EnergyEquivalencyElectricOutput, EnergyEquivalencyFuelOutput } from '../../../../shared/models/phast/energyEquivalency';
@Component({
  selector: 'app-energy-equivalency-form',
  templateUrl: './energy-equivalency-form.component.html',
  styleUrls: ['./energy-equivalency-form.component.css']
})
export class EnergyEquivalencyFormComponent implements OnInit {
  @Input()
  energyEquivalencyElectric: EnergyEquivalencyElectric;
  @Input()
  energyEquivalencyFuel: EnergyEquivalencyFuel;
  @Input()
  energyEquivalencyElectricOutput: EnergyEquivalencyElectricOutput;
  @Input()
  energyEquivalencyFuelOutput: EnergyEquivalencyFuelOutput;
  @Output('calculateFuel')
  calculateFuel = new EventEmitter<boolean>();
  @Output('calculateElectric')
  calculateElectric = new EventEmitter<boolean>();

  constructor() { }

  ngOnInit() {
  }
  calcElectric() {
    this.calculateElectric.emit(true);
  }
  calcFuel() {
    this.calculateFuel.emit(true);
  }
}
