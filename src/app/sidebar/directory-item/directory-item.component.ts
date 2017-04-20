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
  selectedDirectory: Directory;
  @Output('selectSignal')
  selectSignal = new EventEmitter<Directory>();
  @Output('collapseSignal')
  collapseSignal = new EventEmitter<Directory>();

  isFirstChange: boolean = true;

  constructor(private indexedDbService: IndexedDbService) { }

  ngOnChanges(changes: SimpleChanges) {
    console.log(changes.directory);
    if (changes.directory && !this.isFirstChange) {
      this.populateDirectories(this.directory);
    }else{
      this.isFirstChange = false;
    }
  }

  ngOnInit() {
    this.populateDirectories(this.directory);
    if (!this.directory.collapsed) {
      this.directory.collapsed = true;
    }
  }

  toggleSelected(directory: Directory) {
    this.selectSignal.emit(directory);
  }

  toggleDirectoryCollapse(directory: Directory) {
    this.collapseSignal.emit(directory);
  }

  populateDirectories(directoryRef: DirectoryDbRef) {
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
        this.directory.assessments = results;
      }
    );

    this.indexedDbService.getChildrenDirectories(directoryRef.id).then(
      results => {
        this.directory.subDirectory = results;
      }
    )
  }
}
