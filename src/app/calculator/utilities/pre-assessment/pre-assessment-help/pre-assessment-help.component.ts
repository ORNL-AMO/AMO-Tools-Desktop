import { Component, OnInit, Input } from '@angular/core';
@Component({
    selector: 'app-pre-assessment-help',
    templateUrl: './pre-assessment-help.component.html',
    styleUrls: ['./pre-assessment-help.component.css'],
    standalone: false
})
export class PreAssessmentHelpComponent implements OnInit {
  @Input()
  currentField: string;
  @Input()
  currentAssessmentType: string;

  constructor() { }

  ngOnInit() {
  }
}
