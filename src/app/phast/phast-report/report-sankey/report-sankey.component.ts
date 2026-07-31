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

  phastCostSavings: number = 0;
  phastEnergySavings: number = 0;

  energySavingsUnit: string;

  assessmentName: string;
  phastOptions: Array<SankeyScenarioOption>;
  phasts: Array<PHAST>;
  modExists: boolean = false;
  constructor(private executiveSummaryService: ExecutiveSummaryService) { }

  ngOnInit() {
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.assessmentName = this.assessment.name.replace(/\s/g, '');
    this.assessmentName = this.assessmentName.replace('(', '');
    this.assessmentName = this.assessmentName.replace(')', '');
    this.modExists = !!this.phast.modifications?.length;
    this.phasts = [this.phast, ...(this.phast.modifications ?? []).map(mod => mod.phast)];
    this.phastOptions = this.phasts.map(phast => ({ name: phast.name, value: phast }));

    this.energySavingsUnit = this.settings.energyResultUnit + "/yr";
  }

  setPhast(selectedPhast: PHAST) {
    let isMod = selectedPhast.name !== this.phast.name;
    let tmpSummary = this.executiveSummaryService.getSummary(selectedPhast, isMod, this.settings, this.phast, this.baseline);
    this.phastCostSavings = tmpSummary.annualCostSavings;
    this.phastEnergySavings = tmpSummary.annualEnergySavings;
  }
}
