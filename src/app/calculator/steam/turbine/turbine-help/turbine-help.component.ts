import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { TurbineRanges, TurbineService } from '../turbine.service';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-turbine-help',
  templateUrl: './turbine-help.component.html',
  styleUrls: ['./turbine-help.component.css']
})
export class TurbineHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  outletQuantity: number;
  @Input()
  inletQuantity: number;
  @Input()
  turbineProperty: number;

  rangeValues: TurbineRanges;
  constructor(private turbineService: TurbineService, private steamService: SteamService) { }

  ngOnInit() {
    this.getRanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.outletQuantity) {
      this.getRanges();
    }
    if (changes.inletQuantity) {
      this.getRanges();
    }
  }


  getRanges() {
    this.rangeValues = this.turbineService.getRangeValues(this.settings, this.inletQuantity, this.outletQuantity);
  }

  getDisplayUnit(unit: string) {
    if (unit) {
      return this.steamService.getDisplayUnit(unit);
    } else {
      return unit;
    }
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
}
