import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PrvRanges, PrvService, FeedwaterRanges } from '../prv.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-prv-help',
    templateUrl: './prv-help.component.html',
    styleUrls: ['./prv-help.component.css'],
    standalone: false
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
  @Input()
  isSuperHeating: boolean;
  @Input()
  outletPressure: number; 
  
  rangeValues: PrvRanges;
  feedwaterRangesValues: FeedwaterRanges;
  constructor(private prvService: PrvService) { }

  ngOnInit() {
    this.getRanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.thermodynamicQuantity) {
      this.getRanges();
    }
    if (changes.feedwaterThermodynamicQuantity) {
      this.getRanges();
    }
  }

  getRanges() {
    this.rangeValues = this.prvService.getRangeValues(this.settings, this.thermodynamicQuantity);
    this.feedwaterRangesValues = this.prvService.getFeedwaterRangeValues(this.settings, this.feedwaterThermodynamicQuantity, this.outletPressure);
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
