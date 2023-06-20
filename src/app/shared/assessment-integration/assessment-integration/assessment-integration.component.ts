import { Component, EventEmitter, Input, Output, SimpleChanges } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AssessmentType, ConnectedItem} from '../integrations';
import { Router } from '@angular/router';
import { AssessmentDbService } from '../../../indexedDb/assessment-db.service';
import { Assessment } from '../../models/assessment';
import * as _ from 'lodash';

@Component({
  selector: 'app-assessment-integration',
  templateUrl: './assessment-integration.component.html',
  styleUrls: ['./assessment-integration.component.css']
})
export class AssessmentIntegrationComponent {
  @Input()
  assessmentType: AssessmentType;
  @Input()
  connectedInventoryItem: ConnectedItem;
  @Input()
  connectedAssessmentItems: Array<ConnectedItem>;
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
        this.connectedAssessments.push(assessment);
      });
      this.connectedAssessments = _.orderBy(this.connectedAssessments, 'modifiedDate');
    }
  }

  showCreateAssessmentModal() {
    this.modalOpen.emit(true);
    this.displayCreateAssessmentModal = true;
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