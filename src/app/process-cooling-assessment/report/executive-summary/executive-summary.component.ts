import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { Settings } from 'http2';
import { ExecutiveSummaryResults } from 'process-flow-lib';
import { Assessment } from '../../../shared/models/assessment';
import { ProcessCoolingResults } from '../../../shared/models/process-cooling-assessment';
import { ProcessCoolingResultsService } from '../../services/process-cooling-results.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-executive-summary',
  standalone: false,
  templateUrl: './executive-summary.component.html',
  styleUrl: './executive-summary.component.css'
})
export class ExecutiveSummaryComponent {
  private resultsService = inject(ProcessCoolingResultsService);
  
  @Input()
  inRollup: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  settings: Settings;

  notes: Array<{
    modificationName: string,
    note: string
  }>;
  selectedModificationIndex: number = 1;

  baselineResults: ExecutiveSummaryResults;
  modificationResults: ExecutiveSummaryResults[] = [];
  isValid: boolean;

  baselineResults$: Observable<ProcessCoolingResults> = this.resultsService.baselineResults$;
  modificationResults$: Observable<ProcessCoolingResults> = this.resultsService.modificationResults$;

  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;
  copyTable1String: any;


  updateCopyTable1String() {
    this.copyTable1String = this.copyTable1.nativeElement.innerText;
  }


}
