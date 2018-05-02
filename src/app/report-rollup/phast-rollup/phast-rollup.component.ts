import { Component, OnInit, Input } from '@angular/core';
import { PhastResultsData } from '../report-rollup.service';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';
import { PreAssessment } from '../../calculator/utilities/pre-assessment/pre-assessment';
@Component({
  selector: 'app-phast-rollup',
  templateUrl: './phast-rollup.component.html',
  styleUrls: ['./phast-rollup.component.css']
})
export class PhastRollupComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phastResults: Array<PhastResultsData>;
  @Input()
  calculators: Array<Calculator>;
  showPreAssessment: boolean = true;
  constructor() { }

  ngOnInit() {
    if (!this.calculators || this.calculators.length == 0) {
      this.showPreAssessment = false;
    }
    else {
      this.showPreAssessment = true;
    }
  }
}
