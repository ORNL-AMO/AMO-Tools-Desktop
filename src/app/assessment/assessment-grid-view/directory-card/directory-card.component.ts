import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Directory, DirectoryDbRef } from '../../../shared/models/directory';
import { IndexedDbService } from '../../../indexedDb/indexed-db.service';

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
  constructor(private indexedDbService: IndexedDbService) { }

  ngOnInit() {
    let tmpDirectory = this.populateDirectories(this.directory);
    this.directory.assessments = tmpDirectory.assessments;
    this.directory.subDirectory = tmpDirectory.subDirectory;
    this.directory.collapsed = tmpDirectory.collapsed;
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

  populateDirectories(directoryRef: DirectoryDbRef): Directory {
    let tmpDirectory: Directory = {
      name: directoryRef.name,
      createdDate: directoryRef.createdDate,
      modifiedDate: directoryRef.modifiedDate,
      id: directoryRef.id,
      collapsed: false,
      parentDirectoryId: directoryRef.id
    }
    this.indexedDbService.getDirectoryAssessments(directoryRef.id).then(
      results => {
        tmpDirectory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directoryRef.id).then(
      results => {
        tmpDirectory.subDirectory = results;
      }
    )
    return tmpDirectory;
  }

  setDelete() {
    this.directory.selected = this.isChecked;
  }

}
