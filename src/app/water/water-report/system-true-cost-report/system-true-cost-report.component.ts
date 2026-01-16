import { Component, DestroyRef, ElementRef, inject, Injector, Input, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Settings } from '../../../shared/models/settings';
import { WaterAssessmentResultsService } from '../../water-assessment-results.service';
import { WaterReportService } from '../water-report.service';
import * as _ from 'lodash';
import { UpdateDiagramFromAssessmentService } from '../../../water-process-diagram/update-diagram-from-assessment.service';
import { Diagram } from '../../../shared/models/diagram';
import { getIsDiagramValid, NodeErrors, SystemTrueCostData } from 'process-flow-lib';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { TrueCostEditableTableComponent, TrueCostEditableTableDataInputs } from '../true-cost-editable-table/true-cost-editable-table.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-system-true-cost-report',
  standalone: false,
  templateUrl: './system-true-cost-report.component.html',
  styleUrl: './system-true-cost-report.component.css'
})
export class SystemTrueCostReportComponent {
  destroyRef = inject(DestroyRef);
  
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
  trueCostOfSystemsReport: SystemTrueCostData[] = [];
  systemTrueCostReportSubscription: any;
  isDiagramValid: boolean;

  @ViewChild('copyTable', { static: false }) copyTable: ElementRef;  
  copyTableString: any;

  constructor(
    private waterReportService: WaterReportService,
    private waterAssessmentResultsService: WaterAssessmentResultsService,
    private updateDiagramFromAssessmentService: UpdateDiagramFromAssessmentService,
    private modalDialogService: ModalDialogService,
    private injector: Injector
  ) { }

  ngOnInit(): void {
    let diagram: Diagram = this.updateDiagramFromAssessmentService.getDiagramFromAssessment(this.assessment);
    let nodeErrors: NodeErrors = diagram.waterDiagram.flowDiagramData.nodeErrors;
    
    this.systemTrueCostReportSubscription = this.waterReportService.systemTrueCostReport.subscribe(report => {
      this.isDiagramValid = getIsDiagramValid(nodeErrors);
      if (this.isDiagramValid) {
        this.trueCostOfSystemsReport = this.waterReportService.getSortedTrueCostReport(report);
      } else {
        this.trueCostOfSystemsReport = [];
      }
    });

    this.modalDialogService.closedResult.pipe(
      takeUntilDestroyed(this.destroyRef)
    ).subscribe((result) => {
      if (this.assessment) {
        let systemTrueCostReport = this.waterAssessmentResultsService.getTrueCostOfSystemsReport(this.assessment, this.settings);
        this.waterReportService.systemTrueCostReport.next(systemTrueCostReport);
      }
    });
  }

  ngOnDestroy() {
    this.systemTrueCostReportSubscription.unsubscribe();
  }

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
