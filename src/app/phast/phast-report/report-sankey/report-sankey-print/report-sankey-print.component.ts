import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../../shared/models/phast/phast';
import { Settings } from '../../../../shared/models/settings';
@Component({
  selector: 'app-report-sankey-print',
  templateUrl: './report-sankey-print.component.html',
  styleUrls: ['./report-sankey-print.component.css']
})
export class ReportSankeyPrintComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;
  @Input()
  printView: boolean;
  @Input()
  modExists: boolean;
  @Input()
  assessmentName: string;

  baseline: PHAST;
  modification: PHAST;
  phastOptions: Array<any>;


  constructor() { }

  ngOnInit() {
    this.phastOptions = new Array<any>();
    this.phastOptions.push({ name: 'Baseline', phast: this.phast });
    this.baseline = this.phastOptions[0];
    if (this.phast.modifications) {
      this.modExists = true;
      this.phast.modifications.forEach(mod => {
        this.phastOptions.push({ name: mod.phast.name, phast: mod.phast });
      });
      if (this.phastOptions.length > 1) {
        this.phastOptions.shift();
      }
      else {
        this.modExists = false;
      }
    }
  }

}
