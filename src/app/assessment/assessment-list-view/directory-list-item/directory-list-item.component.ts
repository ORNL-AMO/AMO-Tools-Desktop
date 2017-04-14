import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../../shared/models/directory';

@Component({
  selector: 'app-directory-list-item',
  templateUrl: './directory-list-item.component.html',
  styleUrls: ['./directory-list-item.component.css']
})
export class DirectoryListItemComponent implements OnInit {
  @Input()
  directory:Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  goToDirectory(dir){
    this.directoryChange.emit(dir)
  }
}
