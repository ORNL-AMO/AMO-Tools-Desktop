import { Component, DestroyRef, ElementRef, inject, Injector, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import * as _ from 'lodash';
import { sortTrueCostReport, SystemTrueCostData } from 'process-flow-lib';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { TrueCostEditableTableComponent, TrueCostEditableTableDataInputs } from '../true-cost-editable-table/true-cost-editable-table.component';
import { map, Observable } from 'rxjs';

@Component({
  selector: 'app-system-true-cost-report',
  standalone: false,
  templateUrl: './system-true-cost-report.component.html',
  styleUrl: './system-true-cost-report.component.css'
})
export class SystemTrueCostReportComponent {
  private waterAssessmentResultsService = inject(WaterAssessmentResultsService);
  private destroyRef = inject(DestroyRef);
  
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
  trueCostOfSystemsReport$: Observable<SystemTrueCostData[]> = this.waterAssessmentResultsService.trueCostOfSystemsReport$.pipe(
    map((report) => sortTrueCostReport(report, 'desc'))
  );

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(
    private modalDialogService: ModalDialogService,
    private injector: Injector
  ) { }

  ngOnInit(): void {}

  getFlowDecimalPrecisionPipeValue(): string {
    let pipeVal = `1.0-${this.settings.flowDecimalPrecision}`;
    return pipeVal;
  }

  updateCopyTableString() {
    this.copyTableString = this.copyTable.nativeElement.innerText;
  }

  openTrueCostEditableTableModal() {
    this.modalDialogService.openModal<TrueCostEditableTableComponent, TrueCostEditableTableDataInputs>(
      TrueCostEditableTableComponent,
      {
        minWidth: '900px',
        width: '90%',
        data: {
          inRollup: this.inRollup,
          assessment: this.assessment,
          settings: this.settings
        },
      },
      this.injector
    );
  }

}
