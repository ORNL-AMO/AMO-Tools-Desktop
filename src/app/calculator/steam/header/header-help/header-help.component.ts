import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { InletRanges, HeaderService } from '../header.service';
import { SteamService } from '../../steam.service';

@Component({
    selector: 'app-header-help',
    templateUrl: './header-help.component.html',
    styleUrls: ['./header-help.component.css'],
    standalone: false
})
export class HeaderHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  thermodynamicQuantity: number;
  @Input()
  settings: Settings;


  inletRanges: InletRanges;
  pressureRanges: {min: number, max: number};
  constructor(private headerService: HeaderService) { }

  ngOnInit() {
    this.pressureRanges = this.headerService.getPressureRangeValues(this.settings);
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
    this.inletRanges = this.headerService.getInletRangeValues(this.settings, this.thermodynamicQuantity);
  }

  getOptionDisplayUnit() {
    let displayUnit: string;
    if (this.thermodynamicQuantity === 0) {
      displayUnit = this.settings.steamTemperatureMeasurement;
      return displayUnit;
    } else if (this.thermodynamicQuantity === 1) {
      displayUnit = this.settings.steamSpecificEnthalpyMeasurement;
      return displayUnit;
    } else if (this.thermodynamicQuantity === 2) {
      displayUnit = this.settings.steamSpecificEntropyMeasurement;
      return displayUnit;
    } else if (this.thermodynamicQuantity === 3) {
      return displayUnit;
    }
  }
}
