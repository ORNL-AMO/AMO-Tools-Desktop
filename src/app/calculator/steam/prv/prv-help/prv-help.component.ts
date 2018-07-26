import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PrvRanges, PrvService } from '../prv.service';
import { SteamService } from '../../steam.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-prv-help',
  templateUrl: './prv-help.component.html',
  styleUrls: ['./prv-help.component.css']
})
export class PrvHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  thermodynamicQuantity: number;
  @Input()
  feedwaterThermodynamicQuantity: number;

  rangeValues: PrvRanges;
  constructor(private prvService: PrvService, private steamService: SteamService) { }

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
    this.rangeValues = this.prvService.getRangeValues(this.settings, this.thermodynamicQuantity);
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
