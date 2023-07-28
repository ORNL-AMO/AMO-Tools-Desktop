import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-energy-use-form',
  templateUrl: './energy-use-form.component.html',
  styleUrls: ['./energy-use-form.component.css']
})
export class EnergyUseFormComponent implements OnInit {
  @Input()
  energyItems: Array<{ type: string, amount: number }>;
  @Input()
  settings: Settings;
  @Output('emitSave')
  emitSave = new EventEmitter<Array<{ type: string, amount: number }>>();
  @Output('emitChangeField')
  emitChangeField = new EventEmitter<string>();
  constructor() { }

  ngOnInit() {
  }

  addEnergyField() {
    this.energyItems.push({
      type: 'Electricity',
      amount: 0.0
    })
  }

  removeEnergyItem(index: number) {
    this.energyItems.splice(index, 1);
  }

  getEnergyUnit(str: string): string {
    if (str == 'Electricity') {
      return 'kWh';
    } else if (this.settings.unitsOfMeasure == 'Metric') {
      if (str == 'Gas' || str == 'Other Fuel') {
        return 'GJ';
      } else if (str == 'Water' || str == 'WWT') {
        return 'L';
      } else if (str == 'Compressed Air') {
        return 'm<sup>3</sup>';
      } else if (str == 'Steam') {
        return 'tonne';
      }
    } else {
      if (str == 'Gas' || str == 'Other Fuel') {
        return 'MMBtu';
      } else if (str == 'Water' || str == 'WWT') {
        return 'gal';
      } else if (str == 'Compressed Air') {
        return 'scf';
      } else if (str == 'Steam') {
        return 'klb';
      }
    }
  }

  save() {
    this.emitSave.emit(this.energyItems);
  }

  focusField(str: string) {
    this.emitChangeField.emit(str);
  }
}
