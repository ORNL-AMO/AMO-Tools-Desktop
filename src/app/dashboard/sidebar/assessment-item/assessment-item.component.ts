import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
import { ModalDialogService } from '../../../shared/modal-dialog.service';
import { OpenProcessHeatingModuleModalComponent } from '../../../shared/open-process-heating-module-modal/open-process-heating-module-modal.component';
@Component({
    selector: 'app-assessment-item',
    templateUrl: './assessment-item.component.html',
    styleUrls: ['./assessment-item.component.css'],
    standalone: false
})
export class AssessmentItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  constructor(private assessmentService: AssessmentService, private modalDialogService: ModalDialogService) { }

  ngOnInit() {
  }


  goToAssessment(assessment: Assessment) {
    if (assessment.type === 'PHAST') {
      this.modalDialogService.openModal(OpenProcessHeatingModuleModalComponent, {
        data: {
          onSelect: (phastModuleOverride: 'phast' | 'process-heating') =>
            this.assessmentService.goToAssessment(assessment, undefined, undefined, phastModuleOverride),
        },
      });
      return;
    }
    this.assessmentService.goToAssessment(assessment);
  }
}
