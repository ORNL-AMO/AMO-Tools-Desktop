import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { WasteWaterService } from '../../../waste-water.service';
import { StandardSOTRValues } from './standardSOTRValues';
@Component({
  selector: 'app-aerator-performance-help',
  templateUrl: './aerator-performance-help.component.html',
  styleUrls: ['./aerator-performance-help.component.css']
})
export class AeratorPerformanceHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;

  standardSOTRValues: Array<{ label: string, value: number }>;
  settings: Settings;
  constructor(private wasteWaterService: WasteWaterService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    if (this.settings.unitsOfMeasure != 'Imperial') {
      this.standardSOTRValues = this.convertStandardSOTRValues(JSON.parse(JSON.stringify(StandardSOTRValues)));
    } else {
      this.standardSOTRValues = StandardSOTRValues;
    }


    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }

  convertStandardSOTRValues(standardSOTRValues: Array<{ label: string, value: number }>): Array<{ label: string, value: number }> {
    standardSOTRValues.forEach(sotrValue => {
      sotrValue.value = this.convertUnitsService.value(sotrValue.value).from('lbhp').to('kgkw');
      sotrValue.value = this.convertUnitsService.roundVal(sotrValue.value, 1);
    });
    return standardSOTRValues;
  }
}
