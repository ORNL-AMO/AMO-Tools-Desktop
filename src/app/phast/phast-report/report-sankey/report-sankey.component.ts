import { Component, OnInit, Input } from '@angular/core';
import { PHAST } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
@Component({
  selector: 'app-report-sankey',
  templateUrl: './report-sankey.component.html',
  styleUrls: ['./report-sankey.component.css']
})
export class ReportSankeyComponent implements OnInit {
  @Input()
  phast: PHAST;
  @Input()
  settings: Settings;

  modification: PHAST;

  phastOptions: Array<any>;
  phast1: PHAST;
  phast2: PHAST;
  constructor() { }

  ngOnInit() {
    this.phastOptions = new Array<any>();
    this.phastOptions.push({name: 'Baseline', phast: this.phast});
    this.phast1 = this.phastOptions[0];
    if (this.phast.modifications) {
      this.phast.modifications.forEach(mod => {
        this.phastOptions.push({name: mod.phast.name, phast: mod.phast});
      })
      this.phast2 = this.phastOptions[1];
    }
  }

}
