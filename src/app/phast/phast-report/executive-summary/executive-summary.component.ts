import { Component, OnInit, Input } from '@angular/core';
import { PhastService } from '../../phast.service';
import { PHAST, PhastResults, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { ExecutiveSummaryService, SummaryNote } from '../executive-summary.service';
import * as _ from 'lodash';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
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
  @Input()
  assessment: Assessment;
  @Input()
  inPhast: boolean;

  baseline: ExecutiveSummary;

  modifications: Array<ExecutiveSummary>;
  phastMods: Array<any>;
  selectedModificationIndex: number;
  notes: Array<SummaryNote>;
  timeUnit: string;
  energyUnit: string;

  constructor(private executiveSummaryService: ExecutiveSummaryService, private reportRollupService: ReportRollupService) { }

  ngOnInit() {
    this.notes = new Array();
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.modifications = new Array<ExecutiveSummary>();
    if (this.phast.modifications) {
      this.phastMods = this.phast.modifications;
      this.phast.modifications.forEach(mod => {
        let tmpSummary = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.phast, this.baseline);
        this.modifications.push(tmpSummary);
      })
      // this.initMaxAnnualSavings();
      this.notes = this.executiveSummaryService.buildSummaryNotes(this.phast.modifications);
    }

    this.timeUnit = this.settings.energyResultUnit + '/yr';
    if (this.settings.unitsOfMeasure == 'Metric') {
      this.energyUnit = this.settings.energyResultUnit + '/kg';
    } else if (this.settings.unitsOfMeasure == 'Imperial') {
      this.energyUnit = this.settings.energyResultUnit + '/lb';
    }

    if (!this.inPhast) {
      this.reportRollupService.selectedPhasts.subscribe(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId == this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          })
        }
      });
    }
  }

  useModification() {
    this.reportRollupService.updateSelectedPhasts(this.assessment, this.selectedModificationIndex);
  }

}

