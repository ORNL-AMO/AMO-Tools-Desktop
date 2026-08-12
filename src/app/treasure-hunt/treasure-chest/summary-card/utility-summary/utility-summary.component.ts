import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-utility-summary',
    templateUrl: './utility-summary.component.html',
    styleUrls: ['./utility-summary.component.css'],
    standalone: false
})
export class UtilitySummaryComponent {
  @Input()
  summaryData: { totalPercentSavings: number, totalCostSavings: number, baselineCost: number, modificationCost: number };
  @Input()
  label: string;
  @Input()
  currency: string;
}
