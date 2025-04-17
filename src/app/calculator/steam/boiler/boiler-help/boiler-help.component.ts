import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { BoilerRanges, BoilerService } from '../boiler.service';

@Component({
    selector: 'app-boiler-help',
    templateUrl: './boiler-help.component.html',
    styleUrls: ['./boiler-help.component.css'],
    standalone: false
})
export class BoilerHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  thermodynamicQuantity: number;

  rangeValues: BoilerRanges;
  constructor(private boilerService: BoilerService) { }

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
    this.rangeValues = this.boilerService.getRangeValues(this.settings, this.thermodynamicQuantity);
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
