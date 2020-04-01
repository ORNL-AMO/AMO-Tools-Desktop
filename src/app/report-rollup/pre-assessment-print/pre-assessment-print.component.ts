import { Component, OnInit, Input } from '@angular/core';
import { Calculator } from '../../shared/models/calculators';
import { Settings } from '../../shared/models/settings';

@Component({
  selector: 'app-pre-assessment-print',
  templateUrl: './pre-assessment-print.component.html',
  styleUrls: ['./pre-assessment-print.component.css']
})
export class PreAssessmentPrintComponent implements OnInit {
  @Input()
  calculator: Calculator;
  @Input()
  settings: Settings;

  constructor() { }

  ngOnInit(): void {
  }

}
