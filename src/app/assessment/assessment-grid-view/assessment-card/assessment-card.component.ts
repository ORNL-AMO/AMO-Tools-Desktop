import { Component, OnInit, Input } from '@angular/core';
import { PSAT } from '../../../shared/models/psat';
@Component({
  selector: 'app-assessment-card',
  templateUrl: './assessment-card.component.html',
  styleUrls: ['./assessment-card.component.css']
})
export class AssessmentCardComponent implements OnInit {
  @Input()
  assessment: PSAT;
  constructor() { }

  ngOnInit() {
  }

}
