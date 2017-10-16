import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { ExecutiveSummaryService } from '../executive-summary.service';
@Component({
  selector: 'app-executive-summary',
  templateUrl: './executive-summary.component.html',
  styleUrls: ['./executive-summary.component.css']
})
export class ExecutiveSummaryComponent implements OnInit {
  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;

  baseline: ExecutiveSummary;

  modifications: Array<ExecutiveSummary>;

  constructor(private executiveSummaryService: ExecutiveSummaryService) { }

  ngOnInit() {
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.modifications = new Array<ExecutiveSummary>();
    if (this.phast.modifications) {
      this.phast.modifications.forEach(mod => {
        let tmpSummary = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.phast, this.baseline);
        this.modifications.push(tmpSummary);
      })
    }
  }

}
