import { Component, effect, ElementRef, inject, ViewChild, WritableSignal } from '@angular/core';
import { ExecutiveSummaryResultsService, ExecutiveSummaryUI, SummaryView } from '../../services/executive-summary-results.service';
import { Observable } from 'rxjs';
import { ModificationService } from '../../services/modification.service';
import { ProcessCoolingUiService } from '../../services/process-cooling-ui.service';


@Component({
  selector: 'app-executive-summary',
  standalone: false,
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent {
  private executiveSummaryResultsService = inject(ExecutiveSummaryResultsService);
  private modificationService = inject(ModificationService);
  private processCoolingUiService = inject(ProcessCoolingUiService);
  
  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;
  copyTableString: any;
  
  // todo needs notes
  notes: Array<{
    modificationName: string,
    note: string
  }>;
  
  resultsViewSignal: WritableSignal<SummaryView> = this.processCoolingUiService.executiveSummaryView;
  executiveSummaryUI$: Observable<ExecutiveSummaryUI>;
  invalidModificationIds: WritableSignal<Array<string>> = this.modificationService.invalidModificationIds;


  constructor() {
    effect(() => {
      const view = this.resultsViewSignal();

      if (view === 'report') {
        this.executiveSummaryUI$ = this.executiveSummaryResultsService.executiveSummaryUI$;
      } else if (view === 'baseline-panel') {
        this.executiveSummaryUI$ = this.executiveSummaryResultsService.executiveSummaryBaseline$;
      } else if (view === 'modification-panel') {
        this.executiveSummaryUI$ = this.executiveSummaryResultsService.executiveSummarySelectedModificationUI$;
      }
    })
  }


  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

}

