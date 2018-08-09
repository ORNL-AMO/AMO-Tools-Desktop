import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-steam-properties-help',
  templateUrl: './steam-properties-help.component.html',
  styleUrls: ['./steam-properties-help.component.css']
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
  
  constructor(private steamService: SteamService) { }

  ngOnInit() {
  }
  getOptionDisplayUnit(quantity: number) {
    let displayUnit: string;
    if (quantity == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (quantity == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (quantity == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (quantity == 3) {
      return displayUnit;
    }
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }
}
