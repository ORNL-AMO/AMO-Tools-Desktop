import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Directory } from '../../../shared/models/directory';
@Component({
  selector: 'app-directory-card',
  templateUrl: './directory-card.component.html',
  styleUrls: ['./directory-card.component.css']
})
export class DirectoryCardComponent implements OnInit {
  @Input()
  directory: Directory;
  @Output('directoryChange')
  directoryChange = new EventEmitter();

  constructor() { }

  ngOnInit() {
  }

  goToDirectory(dir){
    this.directoryChange.emit(dir)
  }

}
