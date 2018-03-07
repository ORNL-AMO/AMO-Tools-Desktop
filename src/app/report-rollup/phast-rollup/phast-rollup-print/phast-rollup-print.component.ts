import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../../shared/models/settings';
import { Calculator } from '../../../shared/models/calculators';
import { PreAssessment } from '../../../calculator/furnaces/pre-assessment/pre-assessment';

@Component({
  selector: 'app-phast-rollup-print',
  templateUrl: './phast-rollup-print.component.html',
  styleUrls: ['./phast-rollup-print.component.css']
})
export class PhastRollupPrintComponent implements OnInit {
  @Input()
  settings: Settings;

  @Input()
  calculators: Array<Calculator>;

  preAssessments: Array<PreAssessment>;
  showPreAssessment: boolean = true;
  constructor() { }

  ngOnInit() {
  }

}
