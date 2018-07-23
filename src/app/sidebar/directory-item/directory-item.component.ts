import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';
import { DirectoryDbService } from '../../indexedDb/directory-db.service';
import { AssessmentDbService } from '../../indexedDb/assessment-db.service';
import { AssessmentService } from '../../assessment/assessment.service';

@Component({
  selector: 'app-directory-item',
  templateUrl: './directory-item.component.html',
  styleUrls: ['./directory-item.component.css']
})
export class DirectoryItemComponent implements OnInit {
  @Input()
  directory: Directory;
  @Input()
  selectedDirectoryId: number;
  @Output('selectSignal')
  selectSignal = new EventEmitter<Directory>();
  @Output('collapseSignal')
  collapseSignal = new EventEmitter<Directory>();
  @Input()
  newDirEventToggle: boolean;
  @Input()
  dashboardView: string;

  isFirstChange: boolean = true;
  childDirectories: Directory;
  validDirectory: boolean = false;
  constructor(private directoryDbService: DirectoryDbService, private assessmentDbService: AssessmentDbService, private assessmentService: AssessmentService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.directory && !this.isFirstChange) {
      this.populateDirectories(this.directory);
    } else if (changes.newDirEventToggle && !this.isFirstChange) {
      this.populateDirectories(this.directory);
    }
    else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    if (this.directory.id != undefined) {
      this.validDirectory = true;
      this.populateDirectories(this.directory);
      if (this.directory.id == this.selectedDirectoryId) {
        this.toggleSelected(this.directory);
      }
    }
  }

  toggleSelected(directory: Directory) {
    this.assessmentService.dashboardView.next('assessment-dashboard');
    this.selectSignal.emit(directory);
  }

  toggleDirectoryCollapse(directory: Directory) {
    this.collapseSignal.emit(directory);
  }

  populateDirectories(directoryRef: DirectoryDbRef) {
    this.directory.assessments = this.assessmentDbService.getByDirectoryId(directoryRef.id);
    this.directory.subDirectory = this.directoryDbService.getSubDirectoriesById(directoryRef.id);
    this.directory.collapsed = false;
  }
}
