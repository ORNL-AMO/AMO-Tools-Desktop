import { Component, Input } from '@angular/core';
import { DryerOperatingCostOutput } from '../../../../shared/models/standalone';
import { Settings } from '../../../../shared/models/settings';

@Component({
  selector: 'app-compressed-air-dryer-results',
  templateUrl: './compressed-air-dryer-results.component.html',
  styleUrl: './compressed-air-dryer-results.component.css',
  standalone: false,
})
export class CompressedAirDryerResultsComponent {
  @Input() baselineOutput: DryerOperatingCostOutput;
  @Input() modificationOutput: DryerOperatingCostOutput;
  @Input() modificationExists: boolean;
  @Input() settings: Settings;

  get annualCostSavings(): number {
    if (!this.modificationExists || !this.baselineOutput || !this.modificationOutput) return 0;
    return this.baselineOutput.totalCostPerYear - this.modificationOutput.totalCostPerYear;
  }
}
