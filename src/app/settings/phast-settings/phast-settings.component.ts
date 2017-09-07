import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Settings } from '../../shared/models/settings';

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

  fuelFiredOptions: Array<string> = [
    'Ladle Heater 1',
    'Ladle Heater 2',
    'Reheat Furnace',
    'Tundish Heater 1',
    'Tundish Heater 2'
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
    if (!this.settingsForm.furnaceType || this.settingsForm.furnaceType == '') {
      this.setOptions();
    }
  }

  setOptions() {
    if (this.settingsForm.value.energySourceType == 'Fuel') {
      this.settingsForm.patchValue({
        furnaceType: 'Ladle Heater 1'
      })
    } else if (this.settingsForm.value.energySourceType == 'Electricity') {
      this.settingsForm.patchValue({
        furnaceType: 'Electrical Infrared'
      })
    }
  }

  startPolling() {
    this.startSavePolling.emit(true);
  }

}
