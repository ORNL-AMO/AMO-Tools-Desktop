import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { NodeErrors, PlantSystemSummaryResults } from 'process-flow-lib';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-system-summary-report',
  standalone: false,
  templateUrl: './system-summary-report.component.html',
  styleUrl: './system-summary-report.component.css'
})
export class SystemSummaryReportComponent {
  private readonly waterAssessmentResultsService = inject(WaterAssessmentResultsService);

  @Input()
  inRollup: boolean;
  @Input()
  settings: Settings;

  errors: NodeErrors;
  notes: Array<{
    modificationName: string,
    note: string
  }>;
  selectedModificationIndex: number = 1;
  plantSystemSummaryResults$: Observable<PlantSystemSummaryResults> = this.waterAssessmentResultsService.plantSystemSummaryResults$;
  isDiagramValid: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;
  systemSummaryReportSubscription: Subscription;
  percentView: boolean = false;


  ngOnInit(): void {
    this.waterAssessmentResultsService.systemStackedBarPercentView.subscribe(val => {
      this.percentView = val;
    });
  }
  
  togglePercentView() {
    this.percentView = !this.percentView;
    this.waterAssessmentResultsService.systemStackedBarPercentView.next(this.percentView);
  }

  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}

