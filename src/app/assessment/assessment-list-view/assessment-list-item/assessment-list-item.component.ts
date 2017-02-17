import { Component, OnInit, Input } from '@angular/core';
import { Assessment } from '../../../shared/models/assessment';

@Component({
  selector: 'app-assessment-list-item',
  templateUrl: './assessment-list-item.component.html',
  styleUrls: ['./assessment-list-item.component.css']
})
export class AssessmentListItemComponent implements OnInit {
  @Input()
  assessment: Assessment;
  constructor() { }

  ngOnInit() {
  }

}
