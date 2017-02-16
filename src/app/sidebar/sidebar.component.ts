import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { Directory } from '../shared/models/directory';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  @Output('directoryChange')
  directoryChange = new EventEmitter();
  @Input()
  directory: Directory;

  selectedDirectory: Directory;
  constructor() { }

  ngOnInit() {
    this.selectedDirectory = this.directory;
  }

  toggleDirectory(dir: Directory){
    dir.collapsed = !dir.collapsed;
    this.selectedDirectory = dir;
    this.directoryChange.emit(dir);
  }

}
