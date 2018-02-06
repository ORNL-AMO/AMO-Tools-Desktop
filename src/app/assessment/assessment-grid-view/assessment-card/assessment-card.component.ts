import { Component, OnInit, Input, SimpleChanges, ViewChild } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';
import { Router } from '@angular/router';
import { AssessmentService } from '../../assessment.service';
import { ModalDirective } from 'ngx-bootstrap';
import { Directory } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import * as _ from 'lodash';

@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css', '../assessment-grid-view.component.css']
})

export class AssessmentCardComponent implements OnInit {
  @Input()
  assessment: Assessment;
  @Input()
  isChecked: boolean;
  isFirstChange: boolean = true;
  @ViewChild('editModal') public editModal: ModalDirective;

  directories: Array<Directory>;
  constructor(private assessmentService: AssessmentService, private router: Router, private indexedDbService: IndexedDbService) { }


  ngOnInit() {
    if (this.isChecked) {
      this.assessment.selected = this.isChecked;
    }
    this.indexedDbService.getAllDirectories().then(dirs => {
      this.directories = dirs;
    })
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.assessment.selected = this.isChecked;
    }
    else {
      this.isFirstChange = false;
    }
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.tab = 'system-setup';
    if (assessment.type == 'PSAT') {
      if (assessment.psat.setupDone) {
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type == 'PHAST') {
      if (assessment.phast.setupDone) {
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    }
  }

  setDelete() {
    this.assessment.selected = this.isChecked;
  }

  showEditModal() {
    this.editModal.show();
  }

  hideEditModal() {
    this.editModal.hide();
  }

  getParentDirStr(id: number) {
    let parentDir = _.find(this.directories, (dir) => { return dir.id == id });
    let str = parentDir.name + '/';
    return str;
  }

}
