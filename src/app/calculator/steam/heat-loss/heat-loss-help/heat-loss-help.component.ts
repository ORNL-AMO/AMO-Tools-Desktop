import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { HeatLossRanges, HeatLossService } from '../heat-loss.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-heat-loss-help',
    templateUrl: './heat-loss-help.component.html',
    styleUrls: ['./heat-loss-help.component.css'],
    standalone: false
})
export class HeatLossHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  thermodynamicQuantity: number;

  rangeValues: HeatLossRanges;
  constructor(private heatLossService: HeatLossService) { }

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
