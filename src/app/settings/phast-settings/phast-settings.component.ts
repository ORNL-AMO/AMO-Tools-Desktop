import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { ConvertUnitsService } from '../../shared/convert-units/convert-units.service';

@Component({
  selector: 'app-phast-settings',
  templateUrl: './phast-settings.component.html',
  styleUrls: ['./phast-settings.component.css']
})
export class PhastSettingsComponent implements OnInit {
  @Input()
  settingsForm: any;
  @Output('startSavePolling')
  startSavePolling = new EventEmitter<boolean>();
  @Input()
  disable: boolean;

  fuelFiredOptions: Array<string> = [
    'Ladle Heater',
    'Reheat Furnace',
    'Tundish Heater',
    'Custom Fuel Furnace'
  ]

  electrotechOptions: Array<string> = [
    'Electrical Infrared',
    'Induction Heating and Melting',
    'Electrical Resistance',
    'Vacuum Furnace',
    'Electric Arc Furnace (EAF)',
    'Custom Electrotechnology'
  ]

  // electricOptions: Array<string>;
  constructor() { }
  ngOnInit() {
    if (!this.settingsForm.value.furnaceType || this.settingsForm.value.furnaceType == '') {
      this.setOptions();
    }
    if(this.disable){
      this.settingsForm.controls.furnaceType.disable();
      this.settingsForm.controls.energySourceType.disable();
      this.settingsForm.controls.customFurnaceName.disable();
    }
  }

  setOptions() {
    if (this.settingsForm.value.energySourceType == 'Fuel') {
      this.settingsForm.patchValue({
        furnaceType: 'Ladle Heater'
      })
    } else if (this.settingsForm.value.energySourceType == 'Electricity') {
      this.settingsForm.patchValue({
        furnaceType: 'Electrical Infrared',
        energyResultUnit: 'kWh'
      })
    }
  }


  startPolling() {
    this.startSavePolling.emit(true);
  }

}
