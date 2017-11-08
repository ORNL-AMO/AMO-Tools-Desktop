import { Component, OnInit, Input } from '@angular/core';
import { PreAssessment } from '../../pre-assessment';

@Component({
  selector: 'app-pre-assessment-metered',
  templateUrl: './pre-assessment-metered.component.html',
  styleUrls: ['./pre-assessment-metered.component.css']
})
export class PreAssessmentMeteredComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  constructor() { }

  ngOnInit() {
  }

}
