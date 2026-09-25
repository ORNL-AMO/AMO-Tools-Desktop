import { Component, Input } from '@angular/core';
import { DryerOperatingCostInput, DryerOperatingCostOutput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';
import { DryerTypeConfig, getDryerTypeConfig } from '../compressed-air-dryer-type-config';

interface DryerResultRow {
  label: string;
  field: keyof DryerOperatingCostOutput;
  imperialUnit: string;
  metricUnit: string;
  appliesTo: (config: DryerTypeConfig) => boolean;
}

@Component({
  selector: 'app-compressed-air-dryer-results',
  templateUrl: './compressed-air-dryer-results.component.html',
  styleUrl: './compressed-air-dryer-results.component.css',
  standalone: false,
})
export class CompressedAirDryerResultsComponent {
  @Input() baselineInput: DryerOperatingCostInput;
  @Input() modificationInput: DryerOperatingCostInput;
  @Input() baselineOutput: DryerOperatingCostOutput;
  @Input() modificationOutput: DryerOperatingCostOutput;
  @Input() modificationExists: boolean;
  @Input() settings: Settings;

  readonly rows: Array<DryerResultRow> = [
    { label: 'Water Removed', field: 'waterRemoved', imperialUnit: 'lb/hr', metricUnit: 'kg/hr', appliesTo: () => true },
    { label: 'Water Removed (Volume)', field: 'waterRemovedVolume', imperialUnit: 'gal/hr', metricUnit: 'L/hr', appliesTo: () => true },
    { label: 'Purge Flow', field: 'purgeFlowRate', imperialUnit: 'SCFM', metricUnit: 'm3/min', appliesTo: config => config.purgeRate !== null },
    { label: 'Purge Rate', field: 'purgeRate', imperialUnit: '%', metricUnit: '%', appliesTo: config => config.purgeRate !== null },
    { label: 'Heater Load', field: 'heaterPower', imperialUnit: 'kW', metricUnit: 'kW', appliesTo: config => config.heater !== 'hidden' },
    { label: 'Heating Hours Per Day', field: 'heatingHoursPerDay', imperialUnit: 'hrs/day', metricUnit: 'hrs/day', appliesTo: config => config.heatingHoursPerDay !== null },
    { label: 'Motor Power', field: 'motorPower', imperialUnit: 'hp', metricUnit: 'kW', appliesTo: config => config.motor !== 'hidden' },
    { label: 'Design DDC', field: 'designDDCPercentage', imperialUnit: '%', metricUnit: '%', appliesTo: config => config.designDDCPercentage !== null },
    { label: 'Regeneration Half-Cycle', field: 'regenerationCycleLength', imperialUnit: 'hrs', metricUnit: 'hrs', appliesTo: config => config.regenerationCycleLength !== null },
  ];

  get hasModification(): boolean {
    return this.modificationExists && !!this.modificationInput;
  }

  get annualCostSavings(): number {
    if (!this.modificationExists || !this.baselineOutput || !this.modificationOutput) return 0;
    return this.baselineOutput.totalCostPerYear - this.modificationOutput.totalCostPerYear;
  }

  isRowShown(row: DryerResultRow): boolean {
    return this.appliesTo(row, this.baselineInput)
      || (this.hasModification && this.appliesTo(row, this.modificationInput));
  }

  appliesTo(row: DryerResultRow, input: DryerOperatingCostInput): boolean {
    return !!input && row.appliesTo(getDryerTypeConfig(input.dryerType));
  }

  getUnit(row: DryerResultRow): string {
    return this.settings.unitsOfMeasure === 'Imperial' ? row.imperialUnit : row.metricUnit;
  }
}
