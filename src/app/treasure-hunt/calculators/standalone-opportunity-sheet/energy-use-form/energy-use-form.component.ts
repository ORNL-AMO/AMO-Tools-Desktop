import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { Subscription } from 'rxjs';
import { TreasureHuntService } from '../../../treasure-hunt.service';
import { TreasureHunt } from '../../../../shared/models/treasure-hunt';
@Component({
    selector: 'app-energy-use-form',
    templateUrl: './energy-use-form.component.html',
    styleUrls: ['./energy-use-form.component.css'],
    standalone: false
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

  treasureHuntSub: Subscription;
  treasureHunt: TreasureHunt;
  availableEnergyTypes: Array<string> = [];
  
  constructor(private treasureHuntService: TreasureHuntService,) { }

  ngOnInit() {
    this.treasureHuntSub = this.treasureHuntService.treasureHunt.subscribe(val => {
      this.treasureHunt = val;
      this.updateAvailableEnergyTypes();
    });
    this.updateAvailableEnergyTypes();
  }

  updateAvailableEnergyTypes() {
    var currentEnergyUsage = this.treasureHunt.currentEnergyUsage;
    if (!currentEnergyUsage) return;
    const allTypes = [
      'Electricity',
      'Gas',
      'Compressed Air',
      'Other Fuel',
      'Steam',
      'Water',
      'WWT'
    ];
    const energyUsageToType = {
      'Electricity': currentEnergyUsage.electricityUsed,
      'Gas': currentEnergyUsage.naturalGasUsed,
      'Compressed Air': currentEnergyUsage.compressedAirUsed,
      'Other Fuel': currentEnergyUsage.otherFuelUsed,
      'Steam': currentEnergyUsage.steamUsed,
      'Water': currentEnergyUsage.waterUsed,
      'WWT': currentEnergyUsage.wasteWaterUsed
    };
    this.availableEnergyTypes = allTypes.filter(type => energyUsageToType[type]);
  }

  addEnergyField() {
    this.energyItems.push({
      type: this.availableEnergyTypes[0] || 'Electricity',
      amount: 0.0
    });
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
        return 'kgal';
      } else if (str == 'Compressed Air') {
        return 'kscf';
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
