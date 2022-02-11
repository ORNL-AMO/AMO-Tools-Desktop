import { Component, OnInit, Input, SimpleChanges } from '@angular/core';
import { PHAST, PhastResults, ShowResultsCategories, Modification, ExecutiveSummary } from '../../../shared/models/phast/phast';
import { Settings } from '../../../shared/models/settings';
import { Assessment } from '../../../shared/models/assessment';
import { PhastResultsService } from '../../phast-results.service';
import { ReportRollupService } from '../../../report-rollup/report-rollup.service';
import { Subscription } from 'rxjs';
import { PhastValidService } from '../../phast-valid.service';
import { PhastReportRollupService } from '../../../report-rollup/phast-report-rollup.service';
import { ExecutiveSummaryService } from '../executive-summary.service';
import { ConvertUnitsService } from '../../../shared/convert-units/convert-units.service';
import { ConvertPhastService } from '../../convert-phast.service';

@Component({
  selector: 'app-results-data',
  templateUrl: './results-data.component.html',
  styleUrls: ['./results-data.component.css']
})
export class ResultsDataComponent implements OnInit {

  @Input()
  settings: Settings;
  @Input()
  phast: PHAST;
  @Input()
  inPhast: boolean;
  @Input()
  assessment: Assessment;
  @Input()
  toggleCalculate: boolean;
  @Input()
  inSetup: boolean;
  @Input()
  modification: Modification;
  @Input()
  inReport: boolean;
  @Input()
  modificationIndex: number;
  
  baseLineResults: PhastResults;
  modificationResults: Array<PhastResults>;
  phastMods: Array<Modification>;
  showResultsCats: ShowResultsCategories;
  lossUnit: string;
  selectedModificationIndex: number;
  decimalCount: string;
  baselineExecutiveSummary: ExecutiveSummary;
  modExecutiveSummaries: Array<ExecutiveSummary>;
  numMods: number = 0;
  selectedPhastsSub: Subscription;
  constructor(private phastResultsService: PhastResultsService, 
              private executiveSummaryService: ExecutiveSummaryService,
              private convertPhastService: ConvertPhastService,
              private phastReportRollupService: PhastReportRollupService,
              private phastValidService: PhastValidService) { }

  ngOnInit() {
    this.getResults();
    if (this.settings.energyResultUnit === 'kWh') {
      this.lossUnit = 'kWh/hr';
    } else {
      this.lossUnit = this.settings.energyResultUnit + '/hr';
    }

    if (this.inReport) {
      this.selectedPhastsSub = this.phastReportRollupService.selectedPhasts.subscribe(val => {
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

    this.setSigFigsCount();
  }


  ngOnChanges(changes: SimpleChanges) {
    if (changes.toggleCalculate) {
      this.getResults();
    }
    if (changes.modificationIndex) {
      this.getResults();
    }
  }

  ngOnDestroy() {
    if (this.selectedPhastsSub) {this.selectedPhastsSub.unsubscribe; }
  }

  useModification() {
    this.phastReportRollupService.updateSelectedPhasts({ assessment: this.assessment, settings: this.settings }, this.selectedModificationIndex);
  }

  getResults() {
    this.modificationResults = new Array<PhastResults>();
    this.showResultsCats = this.phastResultsService.getResultCategories(this.settings);
    if (this.phast.losses) {
      this.baseLineResults = this.phastResultsService.getResults(this.phast, this.settings);
      if (this.settings.furnaceType == "Electric Arc Furnace (EAF)") {
        this.baseLineResults = this.convertPhastService.convertEAFEnergyUsed(this.baseLineResults, this.settings);
      }
      this.baselineExecutiveSummary = this.executiveSummaryService.getSummary(this.phast, false, this.settings, this.phast);
      if (this.phast.modifications && this.inReport) {
        this.phastMods = this.phast.modifications;
        if (this.phast.modifications.length !== 0) {
          this.modExecutiveSummaries = new Array<ExecutiveSummary>();
          this.phast.modifications.forEach(mod => {
            mod.phast.valid = this.phastValidService.checkValid(mod.phast, this.settings);
            let modResults: PhastResults = this.phastResultsService.getResults(mod.phast, this.settings);
            if (this.settings.furnaceType == "Electric Arc Furnace (EAF)") {
              modResults = this.convertPhastService.convertEAFEnergyUsed(modResults, this.settings);
            }
            let executiveSummary: ExecutiveSummary = this.executiveSummaryService.getSummary(mod.phast, false, this.settings, this.phast, this.baselineExecutiveSummary);
            this.modExecutiveSummaries.push(executiveSummary);
            modResults.co2EmissionsOutput.emissionsSavings = this.baseLineResults.co2EmissionsOutput.hourlyTotalEmissionOutput - modResults.co2EmissionsOutput.hourlyTotalEmissionOutput;
            this.modificationResults.push(modResults);
          });
        }
      } else if (this.modification && !this.inSetup && !this.inReport) {
        this.modification.phast.valid = this.phastValidService.checkValid(this.modification.phast, this.settings);
        let modificationResults: PhastResults = this.phastResultsService.getResults(this.modification.phast, this.settings);
        modificationResults.co2EmissionsOutput.emissionsSavings = this.baseLineResults.co2EmissionsOutput.hourlyTotalEmissionOutput - modificationResults.co2EmissionsOutput.hourlyTotalEmissionOutput;
        this.modificationResults.push(modificationResults);
      }
    } else {
      this.baseLineResults = this.phastResultsService.initResults();
    }
  }

  setSigFigsCount() {
    if (this.settings.energyResultUnit !== undefined) {
      if (this.settings.energyResultUnit.trim() === 'MMBtu' || this.settings.energyResultUnit.trim() === 'GJ' || this.settings.energyResultUnit.trim() === 'kWh') {
        this.decimalCount = '1.2-2';
      }
      else {
        this.decimalCount = '1.0-0';
      }
    }
  }
}
