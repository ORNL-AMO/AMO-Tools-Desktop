import { Component, ElementRef, inject, Input, ViewChild } from '@angular/core';
import { ExecutiveSummaryResults } from 'process-flow-lib';
import { Observable } from 'rxjs';
import { TEMPERATURE_HTML } from '../../../shared/app-constants';
import { Assessment } from '../../../shared/models/assessment';
import { ProcessCoolingResults } from '../../../shared/models/process-cooling-assessment';
import { LOAD_LABELS, WET_BULB_BINS } from '../../constants/process-cooling-constants';
import { ProcessCoolingResultsService } from '../../services/process-cooling-results.service';
import { Settings } from '../../../shared/models/settings';

@Component({
  selector: 'app-dev-results',
  standalone: false,
  templateUrl: './dev-results.component.html',
  styleUrls: ['./dev-results.component.css']
})
export class DevResultsComponent {
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

  LOAD_LABELS = LOAD_LABELS;
  WET_BULB_BINS = WET_BULB_BINS;
  TEMPERATURE_HTML = TEMPERATURE_HTML;

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
