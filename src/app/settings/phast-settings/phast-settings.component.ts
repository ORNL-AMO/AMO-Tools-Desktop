import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';
import { UntypedFormGroup } from '@angular/forms';

@Component({
  selector: 'app-phast-settings',
  templateUrl: './phast-settings.component.html',
  styleUrls: ['./phast-settings.component.css']
})
export class PhastSettingsComponent implements OnInit {
  @Input()
  settingsForm: UntypedFormGroup;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();
  @Input()
  disable: boolean;
  @Input()
  inPhast: boolean;

  energyOptions: Array<string> = [
    'MMBtu',
    'Btu',
    'GJ',
    'kJ',
    'kcal',
    'kgce',
    'kgoe',
    'kWh',
    'MWh'
  ];

  fuelFiredOptions: Array<string> = [
    'Ladle Heater',
    'Reheat Furnace',
    'Tundish Heater',
    'Custom Fuel Furnace'
  ];

  electrotechOptions: Array<string> = [
    'Electrical Infrared',
    'Induction Heating and Melting',
    'Electrical Resistance',
    'Vacuum Furnace',
    'Electric Arc Furnace (EAF)',
    'Custom Electrotechnology'
  ];

  // electricOptions: Array<string>;
  energyResultOptions: Array<any>;

  constructor(private convertUnitsService: ConvertUnitsService) { }
  ngOnInit() {
    if (!this.settingsForm.controls.furnaceType.value || this.settingsForm.controls.furnaceType.value === '') {
      this.setOptions();
    }
    if (this.disable) {
      this.settingsForm.controls.furnaceType.disable();
      this.settingsForm.controls.energySourceType.disable();
      this.settingsForm.controls.customFurnaceName.disable();
    }
    this.energyResultOptions = new Array<any>();
    this.energyOptions.forEach(val => {
      let tmpPossibility = {
        unit: val,
        display: this.getUnitName(val),
        displayUnit: this.getUnitDisplay(val)
      };
      this.energyResultOptions.push(tmpPossibility);
    });
  }

  setOptions(isChanged?: boolean) {
    if (this.settingsForm.controls.energySourceType.value === 'Electricity') {
      this.settingsForm.patchValue({furnaceType: 'Electrical Infrared'});
      if (isChanged || !this.settingsForm.controls.energyResultUnit.value) {  
        this.settingsForm.patchValue({energyResultUnit: 'kWh'});
      }
    } else if (this.settingsForm.controls.energySourceType.value === 'Fuel' || this.settingsForm.controls.energySourceType.value === 'Steam') {
      this.settingsForm.patchValue({furnaceType: null});
      if (isChanged || !this.settingsForm.controls.energyResultUnit.value) {
        this.settingsForm.patchValue({energyResultUnit: 'MMBtu'});
      }
    }
    this.startPolling();
  }


  startPolling() {
    this.startSavePolling.emit(true);
  }
  getUnitName(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.plural;
    }
  }
  getUnitDisplay(unit: any) {
    if (unit) {
      return this.convertUnitsService.getUnit(unit).unit.name.display;
    }
  }
}
