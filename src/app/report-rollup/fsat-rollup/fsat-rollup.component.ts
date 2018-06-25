import { Component, OnInit, Input } from '@angular/core';
import { Settings } from '../../shared/models/settings';
import { Calculator } from '../../shared/models/calculators';

@Component({
  selector: 'app-fsat-rollup',
  templateUrl: './fsat-rollup.component.html',
  styleUrls: ['./fsat-rollup.component.css']
})
export class FsatRollupComponent implements OnInit {
  @Input()
  settings: Settings;
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
