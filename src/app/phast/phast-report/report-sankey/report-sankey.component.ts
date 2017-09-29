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
  constructor() { }

  ngOnInit() {
    if (this.phast.modifications) {
      if (this.phast.modifications[0]) {
        this.modification = this.phast.modifications[0].phast;
      }
    }
  }

}
