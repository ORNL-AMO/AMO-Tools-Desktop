import { Component, OnInit, Input } from '@angular/core';
import { PreAssessment } from '../pre-assessment';
@Component({
  selector: 'app-pre-assessment-form',
  templateUrl: './pre-assessment-form.component.html',
  styleUrls: ['./pre-assessment-form.component.css']
})
export class PreAssessmentFormComponent implements OnInit {
  @Input()
  assessment: PreAssessment;

  constructor() { }

  ngOnInit() {
  }

}
