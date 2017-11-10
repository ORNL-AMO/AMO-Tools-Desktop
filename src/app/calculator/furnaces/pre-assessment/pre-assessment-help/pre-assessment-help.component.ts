import { Component, OnInit, Input } from '@angular/core';

@Component({
  selector: 'app-pre-assessment-help',
  templateUrl: './pre-assessment-help.component.html',
  styleUrls: ['./pre-assessment-help.component.css']
})
export class PreAssessmentHelpComponent implements OnInit {
  @Input()
  currentField: string;
  constructor() { }

  ngOnInit() {
  }

}
