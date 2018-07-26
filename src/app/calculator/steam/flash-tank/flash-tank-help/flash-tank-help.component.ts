import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { FlashTankRanges, FlashTankService } from '../flash-tank.service';
import { SteamService } from '../../steam.service';

@Component({
  selector: 'app-flash-tank-help',
  templateUrl: './flash-tank-help.component.html',
  styleUrls: ['./flash-tank-help.component.css']
})
export class FlashTankHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  thermodynamicQuantity: number;
  @Input()
  settings: Settings;
  rangeValues: FlashTankRanges;
  constructor(private flashTankService: FlashTankService, private steamService: SteamService) { }

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
    this.rangeValues = this.flashTankService.getRangeValues(this.settings, this.thermodynamicQuantity);
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
