import { Component, OnInit, Input, Output, EventEmitter, SimpleChanges } from '@angular/core';
import { Directory } from '../../../shared/models/directory';

@Component({
  selector: 'app-directory-list-item',
  templateUrl: './directory-list-item.component.html',
  styleUrls: ['./directory-list-item.component.css']
})
export class DirectoryListItemComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  isChecked: boolean;

  isFirstChange: boolean = true;
  constructor() { }

  ngOnInit() {
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

  setDelete() {
    //this.directory.selected = this.isChecked;
  }
}
