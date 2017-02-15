import { Component, OnInit } from '@angular/core';
import { MockAssessments } from '../shared/mocks/mock-assessment';
import { Directory } from '../shared/models/directory';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  directory: Directory = MockAssessments;

  constructor() { }

  ngOnInit() {
  }

}
