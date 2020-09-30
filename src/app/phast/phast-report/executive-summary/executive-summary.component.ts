import { Component, OnInit, Input } from '@angular/core';
import { PHAST, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService, SummaryNote } from '../executive-summary.service';
import * as _ from 'lodash';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { PhastCompareService } from '../../phast-compare.service';

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
  numMods: number = 0;

  //percent graph variables
  unit: string;
  titlePlacement: string;
  constructor(private executiveSummaryService: ExecutiveSummaryService, private reportRollupService: ReportRollupService, private compareService: PhastCompareService) { }

  ngOnInit() {
    this.unit = '%';
    this.titlePlacement = 'top';
    this.notes = new Array();
    this.baseline = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
    this.modifications = new Array<ExecutiveSummary>();
    if (this.phast.modifications) {
      this.phastMods = this.phast.modifications;
      this.phast.modifications.forEach(mod => {
        let tmpSummary = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.phast, this.baseline);
        this.modifications.push(tmpSummary);
      });
      // this.initMaxAnnualSavings();
      this.notes = this.executiveSummaryService.buildSummaryNotes(this.phast.modifications);
    }

    this.timeUnit = this.settings.energyResultUnit + '/yr';
    if (this.settings.energyResultUnit === 'MMBtu') {
      this.energyUnit = 'Btu/lb';
    }else if (this.settings.energyResultUnit === 'GJ') {
      this.energyUnit = 'kJ/kg';
    }else if (this.settings.unitsOfMeasure === 'Metric') {
      this.energyUnit = this.settings.energyResultUnit + '/kg';
    } else if (this.settings.unitsOfMeasure === 'Imperial') {
      this.energyUnit = this.settings.energyResultUnit + '/lb';
    }

    if (!this.inPhast) {
      this.reportRollupService.selectedPhasts.subscribe(val => {
        if (val) {
          val.forEach(assessment => {
            if (assessment.assessmentId === this.assessment.id) {
              this.selectedModificationIndex = assessment.selectedIndex;
            }
          });
        }
      });
    }

    if (this.phast.modifications) {
      this.numMods = this.phast.modifications.length;
    }
  }

  getModificationsMadeList(modifiedPhast: PHAST): Array<string> {
    let modificationsMadeList: Array<string> = new Array();
    modificationsMadeList = this.compareService.getBadges(this.phast, modifiedPhast).map(mod => mod.modName);
    return modificationsMadeList;
  }

  useModification() {
    this.reportRollupService.updateSelectedPhasts({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

}

