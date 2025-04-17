import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-steam-properties-help',
    templateUrl: './steam-properties-help.component.html',
    styleUrls: ['./steam-properties-help.component.css'],
    standalone: false
})
export class SteamPropertiesHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  ranges: { minPressure: number, maxPressure: number, minQuantityValue: number, maxQuantityValue: number };
  @Input()
  settings: Settings;
  @Input()
  thermodynamicQuantity: number;
  
  constructor() { }

  ngOnInit() {
  }
  getOptionDisplayUnit(quantity: number) {
    let displayUnit: string;
    if (quantity === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (quantity === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (quantity === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (quantity === 3) {
      return displayUnit;
    }
  }
}
