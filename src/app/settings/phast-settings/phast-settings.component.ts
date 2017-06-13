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
    'Electric Arc Furnace',
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
    'Electric Arc Furnace (EAF)'
  ]

  options: Array<string>;

  constructor() { }

  ngOnInit() {
    this.setOptions();
  }

  setOptions(){
    if(this.settingsForm.value.energySourceType == 'Fuel'){
      this.options = this.fuelFiredOptions;
    }else if(this.settingsForm.value.energySourceType == 'Electricity'){
      this.options = this.electrotechOptions;
    }
  }

  startPolling() {
    this.startSavePolling.emit(true);
  }

}
