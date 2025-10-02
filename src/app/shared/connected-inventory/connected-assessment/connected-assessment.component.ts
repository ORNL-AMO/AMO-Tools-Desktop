import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { Router } from '@angular/router';
import _ from 'lodash';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { Assessment, AssessmentType } from '../../models/assessment';
import { ConnectedItem } from '../integrations';

@Component({
    selector: 'app-connected-assessment',
    templateUrl: './connected-assessment.component.html',
    styleUrls: ['./connected-assessment.component.css'],
    standalone: false
})
export class ConnectedAssessmentComponent {
  @Input()
  assessmentType: AssessmentType;
  @Input()
  connectedInventoryItem: ConnectedItem;
  @Input()
  connectedAssessmentItems: Array<ConnectedItem>;
  @Input()
  isItemValid: boolean;
  @Input()
  integratedCreateType: string;
  @Output('focusedField')
  focusedField = new EventEmitter();  
  @Output('modalOpen')
  modalOpen = new EventEmitter();
  connectedAssessments: Array<Assessment> = [];

  displayCreateAssessmentModal: boolean;

  constructor(
    private router: Router,
    private assessmentDbService: AssessmentDbService,
    ) { }
    
  ngOnChanges(changes: SimpleChanges) {
    this.setAssessments();
  }

  ngOnDestroy() {
  }

  setAssessments() {
    this.connectedAssessments = [];
    if (this.connectedAssessmentItems) {
      this.connectedAssessmentItems.forEach((item: ConnectedItem) => {
        let assessment = this.assessmentDbService.findById(item.assessmentId);
        if (assessment) {
          this.connectedAssessments.push(assessment);
        }
      });
      this.connectedAssessments = _.orderBy(this.connectedAssessments, 'modifiedDate');
    }
  }

  showCreateAssessmentModal() {
    this.modalOpen.emit(true);
    this.displayCreateAssessmentModal = true;
  }

  hideCreateAssessmentModal() {
    this.modalOpen.emit(false);
    this.displayCreateAssessmentModal = false;
  }

  goToAssessment(assessment: Assessment) {
      let url: string;
      switch(this.assessmentType) {
        case 'PSAT':
          url = `/psat/${assessment.id}`;
          break;
        default:
          url = undefined;
      }
      if (url) {
        this.router.navigate([url]);
      }
  }

  focusField(focusedField: string) {
    this.focusedField.emit(focusedField);
  }


}