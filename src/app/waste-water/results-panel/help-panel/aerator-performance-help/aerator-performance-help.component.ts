import { Component, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { Settings } from '../../../../shared/models/settings';
import { aerationRanges, AerationRanges } from '../../../waste-water-defaults';
import { WasteWaterService } from '../../../waste-water.service';

@Component({
  selector: 'app-aerator-performance-help',
  templateUrl: './aerator-performance-help.component.html',
  styleUrls: ['./aerator-performance-help.component.css']
})
export class AeratorPerformanceHelpComponent implements OnInit {

  focusedField: string;
  focusedFieldSub: Subscription;

  standardSOTRValues: Array<{ label: string, value: number }>;
  aerationRanges: AerationRanges;
  settings: Settings;

  displaySuggestions: boolean = false;
  constructor(private wasteWaterService: WasteWaterService, private convertUnitsService: ConvertUnitsService) { }

  ngOnInit(): void {
    this.settings = this.wasteWaterService.settings.getValue();
    if (this.settings.unitsOfMeasure != 'Imperial') {
      this.aerationRanges = this.convertAerationRanges(aerationRanges);
    } else {
      this.aerationRanges = aerationRanges;
    }


    this.focusedFieldSub = this.wasteWaterService.focusedField.subscribe(val => {
      this.focusedField = val;
    });
  }

  ngOnDestroy() {
    this.focusedFieldSub.unsubscribe();
  }

  convertAerationRanges(aerationRanges: AerationRanges): AerationRanges {
    aerationRanges.diffusers.forEach(range => {
      range.min = this.convertTransferRate(range.min);
      range.max = this.convertTransferRate(range.max);
      range.default = this.convertTransferRate(range.default);
    });
    aerationRanges.mechanical.forEach(range => {
      range.min = this.convertTransferRate(range.min);
      range.max = this.convertTransferRate(range.max);
      range.default = this.convertTransferRate(range.default);
    });
    aerationRanges.hybrid.forEach(range => {
      range.min = this.convertTransferRate(range.min);
      range.max = this.convertTransferRate(range.max);
      range.default = this.convertTransferRate(range.default);
    });
    return aerationRanges;
  }

  convertTransferRate(value: number) {
    value = this.convertUnitsService.value(value).from('lbhp').to('kgkw');
    value = this.convertUnitsService.roundVal(value, 1);
    return value;
  }

  toggleSuggestions(){
    this.displaySuggestions = !this.displaySuggestions;
  }
}
