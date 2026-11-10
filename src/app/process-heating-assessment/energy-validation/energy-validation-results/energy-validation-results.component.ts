import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, Signal, viewChild } from '@angular/core';
import { EnergyComparisonRow, EnergySummaryResultsService } from '../../report/energy-summary/energy-summary-results.service';
import { ProcessHeatingAssessmentService } from '../../services/process-heating-assessment.service';

@Component({
  selector: 'app-energy-validation-results',
  standalone: false,
  templateUrl: './energy-validation-results.component.html',
  styleUrl: './energy-validation-results.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EnergyValidationResultsComponent {
  private readonly settings = inject(ProcessHeatingAssessmentService).settingsSignal;

  readonly comparison: Signal<EnergyComparisonRow[]> = inject(EnergySummaryResultsService).energyComparison;

  /** Same precision rule as the heat balance results table. */
  readonly decimalCount: Signal<string> = computed(() =>
    ['MMBtu', 'GJ', 'kWh'].includes(this.settings().energyResultUnit?.trim()) ? '1.2-2' : '1.0-0'
  );

  private readonly copyTable = viewChild<ElementRef<HTMLTableElement>>('copyTable');
  copyTableString: string;

  updateCopyTableString(): void {
    this.copyTableString = this.copyTable()?.nativeElement.innerText;
  }
}
