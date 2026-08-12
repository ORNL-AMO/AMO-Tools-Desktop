import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ThermodynamicQuantity } from '../../../../shared/models/steam/steam-inputs';

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

  readonly ThermodynamicQuantity = ThermodynamicQuantity;

  constructor() { }

  ngOnInit() {
  }
  getOptionDisplayUnit(quantity: number) {
    let displayUnit: string;
    if (quantity === ThermodynamicQuantity.TEMPERATURE) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (quantity === ThermodynamicQuantity.ENTHALPY) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (quantity === ThermodynamicQuantity.ENTROPY) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (quantity === ThermodynamicQuantity.QUALITY) {
      return displayUnit;
    }
  }
}
