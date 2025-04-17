import { Component, OnInit, SimpleChanges, Input } from '@angular/core';
import { DeaeratorService, DeaeratorRanges } from '../deaerator.service';
import { Settings } from '../../../../shared/models/settings';

@Component({
    selector: 'app-deaerator-help',
    templateUrl: './deaerator-help.component.html',
    styleUrls: ['./deaerator-help.component.css'],
    standalone: false
})
export class DeaeratorHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  settings: Settings;
  @Input()
  waterThermodynamicQuantity: number;
  @Input()
  steamThermodynamicQuantity: number;

  rangeValues: DeaeratorRanges;
  constructor(private deaeratorService: DeaeratorService) { }

  ngOnInit() {
    this.getRanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.waterThermodynamicQuantity) {
      this.getRanges();
    }
    if (changes.steamThermodynamicQuantity) {
      this.getRanges();
    }
  }


  getRanges() {
    this.rangeValues = this.deaeratorService.getRangeValues(this.settings, this.steamThermodynamicQuantity, this.waterThermodynamicQuantity );
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
