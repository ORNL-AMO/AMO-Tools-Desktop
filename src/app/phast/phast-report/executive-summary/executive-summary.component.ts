import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { PHAST, ExecutiveSummary, PhastResults } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { ExecutiveSummaryService, SummaryNote } from '../executive-summary.service';
import * as _ from 'lodash';
import { PhastCompareService } from '../../phast-compare.service';
import { PhastReportRollupService } from '../../../report-rollup/phast-report-rollup.service';
import { PhastResultsService } from '../../phast-results.service';

@Component({
    selector: 'app-executive-summary',
    templateUrl: './executive-summary.component.html',
    styleUrls: ['./executive-summary.component.css'],
    standalone: false
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

  baselineSummary: ExecutiveSummary;
  baselinePhastResults: PhastResults;
  modificationSummaries: Array<ExecutiveSummary>;
  modificationPhastResults: Array<PhastResults>;
  phastMods: Array<any>;
  selectedModificationIndex: number;
  notes: Array<SummaryNote>;
  timeUnit: string;
  energyUnit: string;
  numMods: number = 0;

  //percent graph variables
  unit: string;
  titlePlacement: string;
  
  @ViewChild('copyTable1', { static: false }) copyTable1: ElementRef;  
  copyTable1String: any;
  
  @ViewChild('copyTable2', { static: false }) copyTable2: ElementRef;  
  copyTable2String: any;
  
  @ViewChild('copyTable3', { static: false }) copyTable3: ElementRef;  
  copyTable3String: any;
  
  @ViewChild('copyTable4', { static: false }) copyTable4: ElementRef;  
  copyTable4String: any;

  constructor(private executiveSummaryService: ExecutiveSummaryService,
    private phastResultsService: PhastResultsService, private phastReportRollupService: PhastReportRollupService, private compareService: PhastCompareService) { }

  ngOnInit() {
    this.unit = '%';
    this.titlePlacement = 'top';
    this.notes = new Array();
    this.baselinePhastResults = this.phastResultsService.getResults(this.phast, this.settings);
    this.baselineSummary = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast, undefined, this.baselinePhastResults);
    this.modificationSummaries = new Array<ExecutiveSummary>();
    this.modificationPhastResults = new Array<PhastResults>();
    if (this.phast.modifications) {
      this.phastMods = this.phast.modifications;
      this.phast.modifications.forEach(mod => {
        let modPhastResults: PhastResults = this.phastResultsService.getResults(mod.phast, this.settings);
        let modSummary: ExecutiveSummary = this.executiveSummaryService.getSummary(mod.phast, true, this.settings, this.phast, this.baselineSummary, modPhastResults);
        if (modSummary.co2EmissionsOutput) {
          modSummary.co2EmissionsOutput.emissionsSavings = this.baselineSummary.co2EmissionsOutput.totalEmissionOutput - modSummary.co2EmissionsOutput.totalEmissionOutput;
        }
        this.modificationSummaries.push(modSummary);
        this.modificationPhastResults.push(modPhastResults);
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
      this.phastReportRollupService.selectedPhasts.subscribe(val => {
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
    this.phastReportRollupService.updateSelectedPhasts({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  
  updateCopyTable1String() {
    this.copyTable1String = this.copyTable1.nativeElement.innerText;
  }
  
  updateCopyTable2String() {
    this.copyTable2String = this.copyTable2.nativeElement.innerText;
  }
  
  updateCopyTable3String() {
    this.copyTable3String = this.copyTable3.nativeElement.innerText;
  }
  
  updateCopyTable4String() {
    this.copyTable4String = this.copyTable4.nativeElement.innerText;
  }

}

