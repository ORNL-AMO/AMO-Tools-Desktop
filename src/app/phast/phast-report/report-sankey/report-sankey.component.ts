import { Component, OnInit, Input } from '@angular/core';
import { PHAST, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService } from '../executive-summary.service';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

@Component({
    selector: 'app-report-sankey',
    templateUrl: './report-sankey.component.html',
    styleUrls: ['./report-sankey.component.css'],
    standalone: false
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

  assessmentName: string;
  phastOptions: Array<SankeyScenarioOption>;
  phast1: PHAST;
  phast2: PHAST;
  modExists: boolean = false;
  constructor(private executiveSummaryService: ExecutiveSummaryService) { }

  ngOnInit() {
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.assessmentName = this.assessment.name.replace(/\s/g, '');
    this.assessmentName = this.assessmentName.replace('(', '');
    this.assessmentName = this.assessmentName.replace(')', '');
    this.phastOptions = [{ name: 'Baseline', value: this.phast }];
    this.phast1 = this.phast;
    if (this.phast.modifications?.length) {
      this.modExists = true;
      this.phast.modifications.forEach(mod => {
        this.phastOptions.push({ name: mod.phast.name, value: mod.phast });
      });
    }
    this.phast2 = this.phast.modifications?.[0]?.phast ?? this.phast;

    this.energySavingsUnit = this.settings.energyResultUnit + "/yr";
    this.getPhast1Savings();
    this.getPhast2Savings();
  }

  onPhast1Change(phast: PHAST) {
    this.phast1 = phast;
    this.getPhast1Savings();
  }

  onPhast2Change(phast: PHAST) {
    this.phast2 = phast;
    this.getPhast2Savings();
  }

  getPhast1Savings() {
    if (!this.phast1) {
      return;
    }
    let isMod = this.phast1.name !== this.phast.name;
    let tmpSummary = this.executiveSummaryService.getSummary(this.phast1, isMod, this.settings, this.phast, this.baseline);
    this.phast1CostSavings = tmpSummary.annualCostSavings;
    this.phast1EnergySavings = tmpSummary.annualEnergySavings;
  }

  getPhast2Savings() {
    if (!this.phast2) {
      return;
    }
    let isMod = this.phast2.name !== this.phast.name;
    let tmpSummary = this.executiveSummaryService.getSummary(this.phast2, isMod, this.settings, this.phast, this.baseline);
    this.phast2CostSavings = tmpSummary.annualCostSavings;
    this.phast2EnergySavings = tmpSummary.annualEnergySavings;
  }
}
