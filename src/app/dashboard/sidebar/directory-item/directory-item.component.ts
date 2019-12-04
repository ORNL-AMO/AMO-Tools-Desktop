import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../../shared/models/directory';

@Component({
  selector: 'app-directory-item',
  templateUrl: './directory-item.component.html',
  styleUrls: ['./directory-item.component.css']
})
export class DirectoryItemComponent implements OnInit {
  @Input()
  directory: Directory;

  constructor() { }

  ngOnInit() {
    this.directory.collapsed = false;
  }

  toggleDirectoryCollapse(directory: Directory) {
    directory.collapsed = !directory.collapsed;
  }
}
