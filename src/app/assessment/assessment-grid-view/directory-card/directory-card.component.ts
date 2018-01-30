import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';
import { Assessment } from '../../../shared/models/assessment';
import { AssessmentService } from '../../assessment.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-directory-card',
  templateUrl: './directory-card.component.html',
  styleUrls: ['./directory-card.component.css', '../assessment-grid-view.component.css']
})
export class DirectoryCardComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  isChecked: boolean;

  isFirstChange: boolean = true;
  constructor(private indexedDbService: IndexedDbService, private assessmentService: AssessmentService, private router: Router) { }

  ngOnInit() {
    this.populateDirectories(this.directory);
    // this.directory.assessments = tmpDirectory.assessments;
    // this.directory.subDirectory = tmpDirectory.subDirectory;
    // this.directory.collapsed = tmpDirectory.collapsed;
    if (this.isChecked) {
      this.directory.selected = this.isChecked;
    }
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.isChecked && !this.isFirstChange) {
      this.directory.selected = this.isChecked;
    }
    else {
      this.isFirstChange = false;
    }
  }

  goToDirectory(dir) {
    this.directoryChange.emit(dir)
  }

  populateDirectories(directory: Directory) {
    // let tmpDirectory: Directory = {
    //   name: directoryRef.name,
    //   createdDate: directoryRef.createdDate,
    //   modifiedDate: directoryRef.modifiedDate,
    //   id: directoryRef.id,
    //   collapsed: false,
    //   parentDirectoryId: directoryRef.id
    // }
    this.indexedDbService.getDirectoryAssessments(directory.id).then(
      results => {
        directory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directory.id).then(
      results => {
        directory.subDirectory = results;
      }
    )
  }

  setDelete() {
    this.directory.selected = this.isChecked;
  }

  goToAssessment(assessment: Assessment) {
    this.assessmentService.tab = 'system-setup';
    if (assessment.type == 'PSAT') {
      if(assessment.psat.setupDone){
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/psat/' + assessment.id);
    } else if (assessment.type == 'PHAST') {
      if(assessment.phast.setupDone){
        this.assessmentService.tab = 'assessment';
      }
      this.router.navigateByUrl('/phast/' + assessment.id);
    }
  }

}
