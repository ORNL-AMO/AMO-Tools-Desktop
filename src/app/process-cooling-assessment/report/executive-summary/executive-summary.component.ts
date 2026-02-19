import { Component, ElementRef, inject, Signal, ViewChild } from '@angular/core';
import { ExecutiveSummaryResultsService, ExecutiveSummaryRow } from '../../services/executive-summary-results.service';
import { ModificationEEMSUsed } from '../../../shared/models/process-cooling-assessment';
import { ModificationService } from '../../services/modification.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-executive-summary',
  standalone: false,
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent {
  private executiveSummaryResultsService = inject(ExecutiveSummaryResultsService);
  private modificationService = inject(ModificationService);
  notes: Array<{
    modificationName: string,
    note: string
  }>;
  selectedModificationIndex: number;
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  copyTableString: any;

  executiveSummaryRows$: Observable<ExecutiveSummaryRow[]> = this.executiveSummaryResultsService.executiveSummaryRows$;
  modificationNames$: Observable<string[]> = this.executiveSummaryResultsService.modificationNames$;
  modificationEEMsUsedSignal: Signal<ModificationEEMSUsed[]> = this.modificationService.modificationEEMsUsedSignal;

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

  // todo needs notes
  // todo needs percent savings
}

