import { Component, Input, OnChanges } from '@angular/core';
import { Settings } from '../../../../shared/models/settings';
import { ConvertUnitsService } from '../../../../shared/convert-units/convert-units.service';
import { ConvertCompressedAirDryerService } from '../convert-compressed-air-dryer.service';
import { getMinimumPurgeAirRate } from '../compressed-air-dryer-type-config';

@Component({
  selector: 'app-compressed-air-dryer-help',
  templateUrl: './compressed-air-dryer-help.component.html',
  styleUrl: './compressed-air-dryer-help.component.css',
  standalone: false,
})
export class CompressedAirDryerHelpComponent implements OnChanges {
  @Input() currentField: string;
  @Input() settings: Settings;

  isMetric: boolean = false;
  // Same bounds the form validates against, in the current units.
  ranges: ReturnType<ConvertCompressedAirDryerService['getValidatorRanges']>;
  // Purge air price floor per $1/kWh of electricity, in the current compressed air rate units.
  purgeAirRateMultiplier: number;

  constructor(private convertCompressedAirDryerService: ConvertCompressedAirDryerService,
    private convertUnitsService: ConvertUnitsService) { }

  ngOnChanges(): void {
    this.isMetric = this.settings?.unitsOfMeasure === 'Metric';
    this.ranges = this.convertCompressedAirDryerService.getValidatorRanges(this.settings ?? { unitsOfMeasure: 'Imperial' } as Settings);
    this.purgeAirRateMultiplier = this.isMetric
      ? this.convertUnitsService.convertDollarPerValue(getMinimumPurgeAirRate(1), 'ft3', 'm3')
      : getMinimumPurgeAirRate(1);
  }
}
