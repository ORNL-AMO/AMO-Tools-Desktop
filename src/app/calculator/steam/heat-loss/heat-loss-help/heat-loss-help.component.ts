import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { HeatLossRanges, HeatLossService } from '../heat-loss.service';
import { Settings } from '../../../../shared/models/settings';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-heat-loss-help',
  templateUrl: './heat-loss-help.component.html',
  styleUrls: ['./heat-loss-help.component.css']
})
export class HeatLossHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  thermodynamicQuantity: number;

  rangeValues: HeatLossRanges;
  constructor(private heatLossService: HeatLossService, private steamService: SteamService) { }

  ngOnInit() {
    this.getRanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.thermodynamicQuantity) {
      if (!changes.thermodynamicQuantity.isFirstChange()) {
        this.getRanges();
      }
    }
  }


  getRanges() {
    this.rangeValues = this.heatLossService.getRangeValues(this.settings, this.thermodynamicQuantity);
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
  }

  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.thermodynamicQuantity == 0) {
      displayUnit = this.getDisplayUnit(this.settings.steamTemperatureMeasurement);
      return displayUnit;
    } else if (this.thermodynamicQuantity == 1) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEnthalpyMeasurement);
      return displayUnit;
    } else if (this.thermodynamicQuantity == 2) {
      displayUnit = this.getDisplayUnit(this.settings.steamSpecificEntropyMeasurement);
      return displayUnit;
    } else if (this.thermodynamicQuantity == 3) {
      return displayUnit;
    }
  }
}
