import { Component, OnInit, Input } from '@angular/core';
import { PHAST, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService } from '../executive-summary.service';
import { SankeyScenarioOption } from '../../../shared/sankey/sankey-scenario-picker/sankey-scenario-picker.component';

export interface PhastSankeyScenario {
  scenario: PHAST;
  costSavings: number;
  energySavings: number;
}

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

  energySavingsUnit: string;

  assessmentName: string;
  phastOptions: Array<SankeyScenarioOption>;
  sankeyScenarios: Array<PhastSankeyScenario> = [];
  modExists: boolean = false;
  constructor(private executiveSummaryService: ExecutiveSummaryService) { }

  ngOnInit() {
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.assessmentName = this.assessment.name.replace(/\s/g, '');
    this.assessmentName = this.assessmentName.replace('(', '');
    this.assessmentName = this.assessmentName.replace(')', '');
    this.modExists = !!this.phast.modifications?.length;
    const phasts = [this.phast, ...(this.phast.modifications ?? []).map(mod => mod.phast!)];
    this.phastOptions = phasts.map(phast => ({ name: phast.name, value: phast }));
    this.sankeyScenarios = phasts.map(phast => {
      const { costSavings, energySavings } = this.getSavings(phast);
      return { scenario: phast, costSavings, energySavings };
    });

    this.energySavingsUnit = this.settings.energyResultUnit + "/yr";
  }

  setPhast(sankeyScenario: PhastSankeyScenario, selectedPhast: PHAST) {
    sankeyScenario.scenario = selectedPhast;
    const { costSavings, energySavings } = this.getSavings(selectedPhast);
    sankeyScenario.costSavings = costSavings;
    sankeyScenario.energySavings = energySavings;
  }

  getSavings(selectedPhast: PHAST): { costSavings: number, energySavings: number } {
    let isMod = selectedPhast !== this.phast;
    let tmpSummary = this.executiveSummaryService.getSummary(selectedPhast, isMod, this.settings, this.phast, this.baseline);
    return { costSavings: tmpSummary.annualCostSavings ?? 0, energySavings: tmpSummary.annualEnergySavings ?? 0 };
  }
}
