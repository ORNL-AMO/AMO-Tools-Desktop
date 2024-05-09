import { Component, OnInit, Input } from '@angular/core';
import { PHAST, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService } from '../executive-summary.service';

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
  @Input()
  assessment: Assessment;
  @Input()
  showPrint: boolean;

  baseline: ExecutiveSummary;

  phast1CostSavings: number = 0;
  phast1EnergySavings: number = 0;
  phast2CostSavings: number = 0;
  phast2EnergySavings: number = 0;

  energySavingsUnit: string;

  modification: PHAST;
  modifications: Array<ExecutiveSummary>;
  assessmentName: string;
  phastOptions: Array<any>;
  phast1: {name, phast};
  phast2: {name, phast};
  modExists: boolean = false;
  constructor(private executiveSummaryService: ExecutiveSummaryService) { }

  ngOnInit() {
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.assessmentName = this.assessment.name.replace(/\s/g, '');
    this.assessmentName = this.assessmentName.replace('(', '');
    this.assessmentName = this.assessmentName.replace(')', '');
    this.phastOptions = new Array<any>();
    this.phastOptions.push({name: 'Baseline', phast: this.phast});
    this.phast1 = this.phastOptions[0];
    if (this.phast.modifications) {
      this.modExists = true;
      this.phast.modifications.forEach(mod => {
        this.phastOptions.push({name: mod.phast.name, phast: mod.phast});
      });
      this.phast2 = this.phastOptions[1];
    }

    this.energySavingsUnit = this.settings.energyResultUnit + "/yr";
    this.getPhast1Savings();
    this.getPhast2Savings();
  }

  getPhast1Savings() {
    if (!this.phast1) {
      return;
    }

    let isMod;
    if (this.phast1.name === this.phast.name) {
      isMod = false;
    }
    else {
      isMod = true;
    }
    let tmpSummary = this.executiveSummaryService.getSummary(this.phast1.phast, isMod, this.settings, this.phastOptions[0].phast, this.baseline);
    this.phast1CostSavings = tmpSummary.annualCostSavings;
    this.phast1EnergySavings = tmpSummary.annualEnergySavings;
  }

  getPhast2Savings() {
    if (!this.phast2) {
      return;
    }
    let isMod;
    if (this.phast2.name === this.phast.name) {
      isMod = false;
    }
    else {
      isMod = true;
    }
    let tmpSummary = this.executiveSummaryService.getSummary(this.phast2.phast, isMod, this.settings, this.phastOptions[0].phast, this.baseline);
    this.phast2CostSavings = tmpSummary.annualCostSavings;
    this.phast2EnergySavings = tmpSummary.annualEnergySavings;
  }
}
