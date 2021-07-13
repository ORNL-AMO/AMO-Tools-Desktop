import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { ModalDirective } from 'ngx-bootstrap';
import { CompressedAirAssessmentService } from '../../../../compressed-air-assessment/compressed-air-assessment.service';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
import { IndexedDbService } from '../../../../indexedDb/indexed-db.service';
import { Assessment } from '../../../../shared/models/assessment';
import { CompressedAirAssessment } from '../../../../shared/models/compressed-air-assessment';
import { LogToolDbService } from '../../../log-tool-db.service';
import { LogToolDbData, LogToolField } from '../../../log-tool-models';
import { LogToolService } from '../../../log-tool.service';

@Component({
  selector: 'app-select-assessment-modal',
  templateUrl: './select-assessment-modal.component.html',
  styleUrls: ['./select-assessment-modal.component.css'],
})
export class SelectAssessmentModalComponent implements OnInit {
  @Output('close')
  close: EventEmitter<boolean> = new EventEmitter<boolean>();


  @ViewChild('selectAssessmentModal', { static: false }) public selectAssessmentModal: ModalDirective;

  compressedAirAssessments: Array<Assessment>;

  constructor(private assessmentDbService: AssessmentDbService, private logToolDbService: LogToolDbService,
    private indexedDbService: IndexedDbService, private router: Router, 
    private compressedAirAssessmentService: CompressedAirAssessmentService, private logToolService: LogToolService) { }

  ngOnInit(): void {
    let allAssessments: Array<Assessment> = this.assessmentDbService.getAll();
    this.compressedAirAssessments = allAssessments.filter(assessment => { return assessment.type == "CompressedAir" });
  }


  ngAfterViewInit() {
    this.showModal();
  }

  closeModal() {
    this.close.emit(true);
  }

  showModal() {
    this.selectAssessmentModal.show();
  }

  hideModal() {
    this.selectAssessmentModal.hide();
    this.close.emit(true);
  }


  selectAssessment(assessment: Assessment) {
    assessment.compressedAirAssessment = this.setDayTypesFromLogTool(assessment.compressedAirAssessment, this.logToolDbService.logToolDbData[0])
    this.indexedDbService.putAssessment(assessment).then(() => {
      this.assessmentDbService.setAll().then(() => {
        this.compressedAirAssessmentService.mainTab.next('system-setup');
        this.compressedAirAssessmentService.setupTab.next('day-types');
        this.router.navigateByUrl('/compressed-air/' + assessment.id);
      })
    })
  }

  setDayTypesFromLogTool(compressedAirAssessment: CompressedAirAssessment, logToolDbData: LogToolDbData): CompressedAirAssessment{
    let logToolFields: Array<LogToolField> = new Array();

    logToolDbData.setupData.fields.forEach(field => {
      if(!field.isDateField && field.useField){
        logToolFields.push(field);
      }
    });
    console.log(logToolFields);
    compressedAirAssessment.logToolData = {
      logToolFields: logToolFields, 
      dayTypeSummaries: logToolDbData.dayTypeData.dayTypeSummaries
    } 
    compressedAirAssessment.logToolData.dayTypeSummaries.forEach(summary => {
      delete summary.data
    });
    compressedAirAssessment.compressedAirDayTypes = new Array();
    logToolDbData.dayTypeData.dayTypes.forEach(logToolDayType => {
      if (logToolDayType.useDayType) {
        compressedAirAssessment.compressedAirDayTypes.push({
          dayTypeId: logToolDayType.dayTypeId,
          name: logToolDayType.label,
          numberOfDays: 0,
          profileDataType: undefined
        });
      }
    });
    return compressedAirAssessment;
  }
}
