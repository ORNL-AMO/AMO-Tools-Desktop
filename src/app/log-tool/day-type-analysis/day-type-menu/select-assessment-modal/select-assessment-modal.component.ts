import { Component, EventEmitter, OnInit, Output, ViewChild } from '@angular/core';
import { ModalDirective } from 'ngx-bootstrap';
import { AssessmentDbService } from '../../../../indexedDb/assessment-db.service';
import { Assessment } from '../../../../shared/models/assessment';

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

  constructor(private assessmentDbService: AssessmentDbService) { }

  ngOnInit(): void {
    let allAssessments: Array<Assessment> = this.assessmentDbService.getAll();
    this.compressedAirAssessments = allAssessments.filter(assessment => {return assessment.type == "CompressedAir"});
  }


  ngAfterViewInit() {
    this.showModal();
  }

  closeModal(){
    this.close.emit(true);
  }

  submit(){

  }
  showModal() {
    this.selectAssessmentModal.show();
  }
  
  hideModal() {
    this.selectAssessmentModal.hide();
    this.close.emit(true);
  }


  selectAssessment(assessment: Assessment){
    
  }
}
