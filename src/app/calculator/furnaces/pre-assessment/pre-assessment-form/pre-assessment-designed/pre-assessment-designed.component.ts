import { Component, OnInit, Input } from '@angular/core';
import { PreAssessment } from '../../pre-assessment';

@Component({
  selector: 'app-pre-assessment-designed',
  templateUrl: './pre-assessment-designed.component.html',
  styleUrls: ['./pre-assessment-designed.component.css']
})
export class PreAssessmentDesignedComponent implements OnInit {
  @Input()
  assessment: PreAssessment;
  constructor() { }

  ngOnInit() {
  }

}
