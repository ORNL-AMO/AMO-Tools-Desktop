import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Directory, DirectoryDbRef } from '../../shared/models/directory';
import { IndexedDbService } from '../../indexedDb/indexed-db.service';

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

  isFirstChange: boolean = true;
  childDirectories: Directory
  constructor(private indexedDbService: IndexedDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.directory && !this.isFirstChange) {
      this.populateDirectories(this.directory, false);
    } else if (changes.newDirEventToggle && !this.isFirstChange) {
      this.populateDirectories(this.directory, false);
    }
    else {
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    if (this.directory.id == 1) {
      this.populateDirectories(this.directory, false);
    } else if (this.directory.id == this.selectedDirectoryId) {
      this.populateDirectories(this.directory, false);
    }
    else {
      this.populateDirectories(this.directory, true);
    }
  }

  toggleSelected(directory: Directory) {
    this.selectSignal.emit(directory);
  }

  toggleDirectoryCollapse(directory: Directory) {
    this.collapseSignal.emit(directory);
  }

  populateDirectories(directoryRef: DirectoryDbRef, collapse?: boolean) {
    this.indexedDbService.getDirectoryAssessments(directoryRef.id).then(
      results => {
        this.directory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directoryRef.id).then(
      results => {
        this.directory.subDirectory = results;
        this.directory.collapsed = collapse;
      }
    )
  }
}
