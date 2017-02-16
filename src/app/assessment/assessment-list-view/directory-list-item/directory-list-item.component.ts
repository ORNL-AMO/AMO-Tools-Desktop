import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../../shared/models/directory';

@Component({
  selector: 'app-directory-list-item',
  templateUrl: './directory-list-item.component.html',
  styleUrls: ['./directory-list-item.component.css']
})
export class DirectoryListItemComponent implements OnInit {
  @Input()
  directory:Directory;

  constructor() { }

  ngOnInit() {
  }

}
