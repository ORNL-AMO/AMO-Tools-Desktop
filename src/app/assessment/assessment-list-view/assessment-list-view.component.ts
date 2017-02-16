import { Component, OnInit, Input } from '@angular/core';
import { Directory } from '../../shared/models/directory';

@Component({
  selector: 'app-assessment-list-view',
  templateUrl: './assessment-list-view.component.html',
  styleUrls: ['./assessment-list-view.component.css']
})
export class AssessmentListViewComponent implements OnInit {
  @Input()
  directory: Directory;
  constructor() { }

  ngOnInit() {
  }

}
